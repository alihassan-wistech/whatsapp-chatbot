import express from "express";
import { query } from "../db";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ============================================
// GET ALL CHATBOTS for logged-in user
// ============================================
router.get("/", async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    // Get all chatbots for this user
    const chatbots = await query(
      `SELECT 
        id, name, description, 
        enable_whatsapp, enable_website,
        created_at, updated_at
      FROM chatbots 
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ chatbots });
  } catch (error) {
    console.error("Get chatbots error:", error);
    res.status(500).json({ error: "Failed to get chatbots" });
  }
});

// ============================================
// GET SINGLE CHATBOT with all details
// ============================================
router.get("/:id", async (req, res) => {
  try {
    const chatbotId = req.params.id;
    const userId = (req as any).user.userId;

    // Get chatbot (verify ownership)
    const chatbots = await query(
      `SELECT * FROM chatbots 
       WHERE id = ? AND user_id = ?`,
      [chatbotId, userId]
    );

    if (!Array.isArray(chatbots) || chatbots.length === 0) {
      return res.status(404).json({ error: "Chatbot not found" });
    }

    const chatbot: any = chatbots[0];

    // Get all questions for this chatbot
    const questions = await query(
      `SELECT 
        id, parent_question_id, trigger_option,
        question_type, question_text, answer_text,
        display_order, is_welcome
      FROM questions
      WHERE chatbot_id = ?
      ORDER BY display_order`,
      [chatbotId]
    );

    // Get options for each question
    for (let question of questions as any[]) {
      if (question.question_type === "options") {
        const options = await query(
          `SELECT option_text, display_order
           FROM question_options
           WHERE question_id = ?
           ORDER BY display_order`,
          [question.id]
        );
        question.options = (options as any[]).map((o) => o.option_text);
      }
    }

    // Get form configuration
    const forms = await query(
      `SELECT id, title, description, position, submit_button_text
       FROM forms
       WHERE chatbot_id = ?`,
      [chatbotId]
    );

    let formConfig = null;
    if (Array.isArray(forms) && forms.length > 0) {
      const form: any = forms[0];

      // Get form fields
      const fields = await query(
        `SELECT id, field_label, field_type, placeholder, is_required, display_order
         FROM form_fields
         WHERE form_id = ?
         ORDER BY display_order`,
        [form.id]
      );

      formConfig = {
        title: form.title,
        description: form.description,
        position: form.position,
        submitButtonText: form.submit_button_text,
        fields: (fields as any[]).map((f) => ({
          id: f.id.toString(),
          label: f.field_label,
          type: f.field_type,
          placeholder: f.placeholder,
          required: Boolean(f.is_required),
          order: f.display_order,
        })),
      };
    }

    // Combine everything
    const response = {
      chatbot: {
        id: chatbot.id,
        name: chatbot.name,
        description: chatbot.description,
        questions,
        formConfig,
        settings: {
          enableWhatsApp: Boolean(chatbot.enable_whatsapp),
          enableWebsite: Boolean(chatbot.enable_website),
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get chatbot error:", error);
    res.status(500).json({ error: "Failed to get chatbot" });
  }
});

// ============================================
// CREATE NEW CHATBOT
// ============================================
router.post("/", async (req, res) => {
  const connection = await (await import("../db")).pool.getConnection();

  try {
    const userId = (req as any).user.userId;
    const { name, description, questions, formConfig, settings } = req.body;

    // Start transaction
    // Why? If any step fails, we rollback everything
    await connection.beginTransaction();

    // 1. Insert chatbot
    const [chatbotResult]: any = await connection.execute(
      `INSERT INTO chatbots (user_id, name, description, enable_whatsapp, enable_website)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        description || null,
        settings?.enableWhatsApp ?? true,
        settings?.enableWebsite ?? true,
      ]
    );

    const chatbotId = chatbotResult.insertId;

    // 2. Insert questions
    if (questions && questions.length > 0) {
      const questionIdMap = new Map(); // Old ID → New ID mapping

      // First pass: Insert all questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        const [questionResult]: any = await connection.execute(
          `INSERT INTO questions 
           (chatbot_id, question_type, question_text, answer_text, display_order, is_welcome)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            chatbotId,
            q.type,
            q.question,
            q.answer || null,
            i,
            q.isWelcome || false,
          ]
        );

        questionIdMap.set(q.id, questionResult.insertId);

        // Insert options if it's an options question
        if (q.type === "options" && q.options) {
          for (let j = 0; j < q.options.length; j++) {
            await connection.execute(
              `INSERT INTO question_options (question_id, option_text, display_order)
               VALUES (?, ?, ?)`,
              [questionResult.insertId, q.options[j], j]
            );
          }
        }
      }

      // Second pass: Update parent relationships
      for (const q of questions) {
        if (q.parentQuestionId) {
          const newQuestionId = questionIdMap.get(q.id);
          const newParentId = questionIdMap.get(q.parentQuestionId);

          if (newQuestionId && newParentId) {
            await connection.execute(
              `UPDATE questions 
               SET parent_question_id = ?, trigger_option = ?
               WHERE id = ?`,
              [newParentId, q.triggerOption, newQuestionId]
            );
          }
        }
      }
    }

    // 3. Insert form configuration
    if (formConfig && formConfig.position !== "none") {
      const [formResult]: any = await connection.execute(
        `INSERT INTO forms (chatbot_id, title, description, position, submit_button_text)
         VALUES (?, ?, ?, ?, ?)`,
        [
          chatbotId,
          formConfig.title,
          formConfig.description || null,
          formConfig.position,
          formConfig.submitButtonText || "Submit",
        ]
      );

      const formId = formResult.insertId;

      // Insert form fields
      if (formConfig.fields && formConfig.fields.length > 0) {
        for (const field of formConfig.fields) {
          await connection.execute(
            `INSERT INTO form_fields 
             (form_id, field_label, field_type, placeholder, is_required, display_order)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              formId,
              field.label,
              field.type,
              field.placeholder || null,
              field.required || false,
              field.order || 0,
            ]
          );
        }
      }
    }

    // Commit transaction - make all changes permanent
    await connection.commit();

    res.status(201).json({
      chatbot: { id: chatbotId },
    });
  } catch (error) {
    // Rollback on error - undo all changes
    await connection.rollback();
    console.error("Create chatbot error:", error);
    res.status(500).json({ error: "Failed to create chatbot" });
  } finally {
    connection.release();
  }
});

// ============================================
// UPDATE CHATBOT
// ============================================
router.put("/:id", async (req, res) => {
  const connection = await (await import("../db")).pool.getConnection();

  try {
    const chatbotId = req.params.id;
    const userId = (req as any).user.userId;
    const { name, description, questions, formConfig, settings } = req.body;

    // Verify ownership
    const chatbots = await connection.execute(
      "SELECT id FROM chatbots WHERE id = ? AND user_id = ?",
      [chatbotId, userId]
    );

    if (!Array.isArray(chatbots[0]) || chatbots[0].length === 0) {
      return res.status(404).json({ error: "Chatbot not found" });
    }

    await connection.beginTransaction();

    // 1. Update chatbot
    await connection.execute(
      `UPDATE chatbots 
       SET name = ?, description = ?, enable_whatsapp = ?, enable_website = ?
       WHERE id = ?`,
      [
        name,
        description || null,
        settings?.enableWhatsApp ?? true,
        settings?.enableWebsite ?? true,
        chatbotId,
      ]
    );

    // 2. Delete old questions and options (CASCADE will handle it)
    await connection.execute("DELETE FROM questions WHERE chatbot_id = ?", [
      chatbotId,
    ]);

    // 3. Insert new questions (same as create)
    // ... (copy question insertion logic from POST route)

    // 4. Update form configuration
    await connection.execute("DELETE FROM forms WHERE chatbot_id = ?", [
      chatbotId,
    ]);

    if (formConfig && formConfig.position !== "none") {
      // ... (copy form insertion logic from POST route)
    }

    await connection.commit();

    res.json({ message: "Chatbot updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Update chatbot error:", error);
    res.status(500).json({ error: "Failed to update chatbot" });
  } finally {
    connection.release();
  }
});

// ============================================
// DELETE CHATBOT
// ============================================
router.delete("/:id", async (req, res) => {
  try {
    const chatbotId = req.params.id;
    const userId = (req as any).user.userId;

    // Delete (CASCADE will handle related records)
    const result: any = await query(
      "DELETE FROM chatbots WHERE id = ? AND user_id = ?",
      [chatbotId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Chatbot not found" });
    }

    res.json({ message: "Chatbot deleted successfully" });
  } catch (error) {
    console.error("Delete chatbot error:", error);
    res.status(500).json({ error: "Failed to delete chatbot" });
  }
});

export default router;
