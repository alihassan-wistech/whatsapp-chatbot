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

    const chatbots = await query(
      `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.enable_whatsapp,
        c.enable_website,
        c.created_at,
        c.updated_at,
        c.user_id,
        q.id AS question_id,
        q.question_text,
        q.answer_text,
        q.question_type,
        q.is_welcome,
        q.parent_question_id,
        q.trigger_option
      FROM chatbots c
      LEFT JOIN questions q ON q.chatbot_id = c.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC, q.display_order ASC;
      `,
      [userId]
    );

    // Group chatbots and their questions manually in Node
    const chatbotMap: Record<string, any> = {};

    for (const row of chatbots as any[]) {
      if (!chatbotMap[row.id]) {
        chatbotMap[row.id] = {
          id: row.id.toString(),
          name: row.name,
          description: row.description,
          questions: [],
          settings: {
            enableWhatsApp: !!row.enable_whatsapp,
            enableWebsite: !!row.enable_website,
          },
          isActive: true,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          userId: row.user_id.toString(),
        };
      }

      if (row.question_id) {
        chatbotMap[row.id].questions.push({
          id: row.question_id.toString(),
          questionText: row.question_text,
          answerText: row.answer_text,
          questionType: row.question_type,
          isWelcome: !!row.is_welcome,
          parentQuestionId: row.parent_question_id
            ? row.parent_question_id.toString()
            : null,
          triggerOption: row.trigger_option,
        });
      }
    }

    const result = Object.values(chatbotMap);
    res.json({ chatbots: result });
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

    // 1. Verify ownership
    const chatbots = (await query(
      `SELECT * FROM chatbots WHERE id = ? AND user_id = ?`,
      [chatbotId, userId]
    )) as any[];

    if (!Array.isArray(chatbots) || chatbots.length === 0) {
      return res.status(404).json({ error: "Chatbot not found" });
    }

    const chatbot: any = chatbots[0];

    // 2. Get all questions
    const rawQuestions = (await query(
      `
      SELECT 
        id, parent_question_id, trigger_option,
        question_type, question_text, answer_text,
        display_order, is_welcome
      FROM questions
      WHERE chatbot_id = ?
      ORDER BY display_order
      `,
      [chatbotId]
    )) as any[];

    // 3. Get all options
    const options = (await query(
      `
      SELECT question_id, option_text, display_order
      FROM question_options
      WHERE question_id IN (
        SELECT id FROM questions WHERE chatbot_id = ?
      )
      ORDER BY question_id, display_order
      `,
      [chatbotId]
    )) as any[];

    // 4. Group options by question_id
    const optionMap: Record<string, string[]> = {};
    for (const opt of options) {
      if (!optionMap[opt.question_id]) optionMap[opt.question_id] = [];
      optionMap[opt.question_id].push(opt.option_text);
    }

    // 5. Build final question format for frontend
    const questions = rawQuestions.map((q) => {
      const formatted: any = {
        id: q.id.toString(),
        type: q.question_type as "text" | "options" | "conditional",
        question: q.question_text,
        answer: q.answer_text || "",
        options: optionMap[q.id] || [],
        conditions: [],
        optionFlows: [],
        parentQuestionId: q.parent_question_id
          ? q.parent_question_id.toString()
          : undefined,
        triggerOption: q.trigger_option || undefined,
        isWelcome: !!q.is_welcome,
      };

      // Conditional example (optional, future logic)
      if (q.question_type === "conditional") {
        formatted.conditions = [
          {
            trigger: q.trigger_option || "",
            nextQuestionId: q.parent_question_id
              ? q.parent_question_id.toString()
              : "",
          },
        ];
      }

      // Option flows (for UI editing)
      if (q.question_type === "options" && optionMap[q.id]) {
        formatted.optionFlows = optionMap[q.id].map((optText) => ({
          optionText: optText,
          nextQuestionId: null,
        }));
      }

      return formatted;
    });

    // 6. Get form configuration
    const forms = (await query(
      `
      SELECT id, title, description, position, submit_button_text
      FROM forms
      WHERE chatbot_id = ?
      `,
      [chatbotId]
    )) as any[];

    let formConfig = null;
    if (Array.isArray(forms) && forms.length > 0) {
      const form: any = forms[0];

      const fields = (await query(
        `
        SELECT id, field_label, field_type, placeholder, is_required, display_order
        FROM form_fields
        WHERE form_id = ?
        ORDER BY display_order
        `,
        [form.id]
      )) as any[];

      formConfig = {
        title: form.title,
        description: form.description,
        position: form.position,
        submitButtonText: form.submit_button_text,
        fields: (fields || []).map((f: any) => ({
          id: f.id.toString(),
          label: f.field_label,
          type: f.field_type,
          placeholder: f.placeholder,
          required: !!f.is_required,
          order: f.display_order,
        })),
      };
    }

    // 7. Combine and send response
    const response = {
      chatbot: {
        id: chatbot.id.toString(),
        name: chatbot.name,
        description: chatbot.description,
        questions,
        formConfig,
        settings: {
          enableWhatsApp: !!chatbot.enable_whatsapp,
          enableWebsite: !!chatbot.enable_website,
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
    const { name, description, questions, settings } = req.body;

    const [chatbots]: any = await connection.execute(
      "SELECT id FROM chatbots WHERE id = ? AND user_id = ?",
      [chatbotId, userId]
    );

    if (!Array.isArray(chatbots) || chatbots.length === 0) {
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

    // 2. Delete old questions (cascade deletes options)
    await connection.execute("DELETE FROM questions WHERE chatbot_id = ?", [
      chatbotId,
    ]);

    // 3. Insert new questions + options
    const idMap = new Map<string, number>();

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const [result]: any = await connection.execute(
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

      idMap.set(q.id, result.insertId);

      if (q.type === "options" && Array.isArray(q.options)) {
        for (let j = 0; j < q.options.length; j++) {
          await connection.execute(
            `INSERT INTO question_options (question_id, option_text, display_order)
             VALUES (?, ?, ?)`,
            [result.insertId, q.options[j], j]
          );
        }
      }
    }

    // 4. Link parent relationships
    for (const q of questions) {
      if (q.parentQuestionId) {
        const newChildId = idMap.get(q.id);
        const newParentId = idMap.get(q.parentQuestionId);
        if (newChildId && newParentId) {
          await connection.execute(
            `UPDATE questions SET parent_question_id = ?, trigger_option = ? WHERE id = ?`,
            [newParentId, q.triggerOption || null, newChildId]
          );
        }
      }
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
