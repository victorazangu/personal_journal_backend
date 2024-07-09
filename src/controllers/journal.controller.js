const { Category, Journal } = require("../models")



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
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        const journalEntries = await Journal.findAll({
            where: {
                author: userId,
            },
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
        return res.status(200).json({ data: journalEntries, page, pageSize, status: "success", success: true });
    } catch (error) {
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};


const listAllJournalEntriesByCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        const journalEntries = await Journal.findAll({
            where: {
                category_id: categoryId,
            },
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
        return res.status(200).json({ data: journalEntries, page, pageSize, status: "success", success: true });
    } catch (error) {
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