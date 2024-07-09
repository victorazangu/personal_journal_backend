const { Category, Journal } = require("../models")
const Sequelize = require("sequelize");
const { Op } = Sequelize;

const createJournal = async (req, res) => {
    try {
        const { title, content, category_id } = req.body;
        let category;

        if (typeof category_id === "string") {
            let existingCategory = await Category.findOne({ where: { name: category_id } });
            if (!existingCategory) {
                existingCategory = await Category.create({ name: category_id });
            }
            category = existingCategory.id;
        } else {
            category = category_id;
        }
        const newJournal = await Journal.create({
            title,
            content,
            author: req.user.id,
            category_id: category,
        });
        return res.status(201).json({ data: newJournal, status: "success", success: true });
    } catch (error) {
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};

const listAllCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 5;
        const offset = (page - 1) * pageSize;
        const categories = await Category.findAll(
            {
                offset: offset,
                limit: pageSize,

            }
        );
        return res.status(200).json({ data: categories, page, pageSize, status: "success", success: true });
    } catch (error) {
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
}


const listAllUsersJournalEntry = async (req, res) => {
    try {
        let { period, from, to } = req.query;
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        let whereClause = {
            author: userId,
        };
        if (period) {
            if (period === 'weekly') {
                from = new Date();
                from.setDate(from.getDate() - from.getDay());
                to = new Date();
            } else if (period === 'monthly') {
                from = new Date();
                from.setDate(1);
                to = new Date();
            }
        } else if (from && to) {
            from = new Date(from);
            to = new Date(to);
            whereClause.createdAt = {
                [Op.between]: [from, to],
            };
        }
        const journalEntries = await Journal.findAll({
            where: whereClause,
            include: [
                {
                    model: Category,
                    attributes: ['name'],
                    required: true,
                }
            ],
            offset: offset,
            limit: pageSize,
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json({ data: journalEntries, page, pageSize, period, from, to, status: "success", success: true });
    } catch (error) {
        console.error("Error fetching user's journal entries:", error);
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};

const listAllJournalEntriesByCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        let { period, from, to } = req.query;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        let whereClause = {
            category_id: categoryId,
        };
        if (period) {
            if (period === 'weekly') {
                from = new Date();
                from.setDate(from.getDate() - from.getDay()); 
                to = new Date();
            } else if (period === 'monthly') {
                from = new Date();
                from.setDate(1); 
                to = new Date();
            }
        } else if (from && to) {
            from = new Date(from);
            to = new Date(to);
            whereClause.createdAt = {
                [Op.between]: [from, to],
            };
        }
        const journalEntries = await Journal.findAll({
            where: whereClause,
            include: [
                {
                    model: Category,
                    attributes: ['name'],
                    required: true,
                }
            ],
            offset: offset,
            limit: pageSize,
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json({ data: journalEntries, page, pageSize, period, from, to, status: "success", success: true });
    } catch (error) {
        console.error("Error fetching journal entries by category:", error);
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};

const getJournalEntryById = async (req, res) => {
    try {
        const journalId = req.params.id;
        const journalEntry = await Journal.findByPk(journalId,
            {
                include: [
                    {
                        model: Category,
                        attributes: ['name'],
                        required: true,
                    }
                ]
            }
        );
        if (!journalEntry) {
            return res.status(404).json({ error: "Journal entry not found", status: "fail", success: false });
        }
        return res.status(200).json({ data: journalEntry, status: "success", success: true });
    } catch (error) {
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};


const updateJournalEntry = async (req, res) => {
    try {
        const journalId = req.params.id;
        const { title, content, category_id } = req.body;
        let journalEntry = await Journal.findByPk(journalId,
            {
                include: [
                    {
                        model: Category,
                        attributes: ['name'],
                        required: true,
                    }
                ]

            });
        if (!journalEntry) {
            return res.status(404).json({ error: "Journal entry not found", status: "fail", success: false });
        }
        journalEntry.title = title;
        journalEntry.content = content;
        journalEntry.category_id = category_id;
        await journalEntry.save();
        return res.status(200).json({ data: journalEntry, status: "success", success: true });
    } catch (error) {
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};



const deleteJournalEntry = async (req, res) => {
    try {
        const journalId = req.params.id;
        const journalEntry = await Journal.findByPk(journalId);
        if (!journalEntry) {
            return res.status(404).json({ error: "Journal entry not found", status: "fail", success: false });
        }
        await journalEntry.destroy();
        return res.status(200).json({ message: "Journal entry deleted successfully", status: "success", success: true });
    } catch (error) {
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};


module.exports = {
    createJournal,
    listAllCategories,
    listAllUsersJournalEntry,
    listAllJournalEntriesByCategory,
    getJournalEntryById,
    updateJournalEntry,
    deleteJournalEntry
};