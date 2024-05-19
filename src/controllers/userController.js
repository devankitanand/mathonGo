const List = require('../models/listModel');
const User = require('../models/userModel');
const { parseCSV } = require('../utils/csvHandler');
const fs = require('fs');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }

}

const getAllList = async(req,res) =>{
    try {
        const lists = await List.find();
        res.json(lists);
    } catch (error) {
        console.log('Error fetching lists');
    }

}

const createList = async (req, res) => {
    const { title, customProperties } = req.body;
    try {
        const newList = new List({ title, customProperties });
        await newList.save();
        res.status(201).json(newList);
    } catch (error) {
        res.status(500).json({ error: 'Error creating list' });
    }
};


const uploadUsers = async (req, res, next) => {
    const { listId } = req.body;
    const filePath = req.file.path;

    try {
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        const { users, errors } = await parseCSV(filePath, list.customProperties);

        const successfullyAdded = [];
        const failedUsers = [...errors];
        const usersToAdd = [];

        
        const existingUsers = await User.find({ listId });
        const userEmails = new Set(existingUsers.map(user => user.email));

        for (let user of users) {
            if (userEmails.has(user.email)) {
                failedUsers.push({ user, error: 'Duplicate email' });
            } else {
                const customProperties = {};
                for (let prop of list.customProperties) {
                    customProperties[prop.title] = user[prop.title] || prop.defaultValue;
                }
                usersToAdd.push({
                    name: user.name,
                    email: user.email,
                    listId,
                    properties: customProperties
                });
            }
        }

        if (usersToAdd.length > 0) {
            const insertedUsers = await User.insertMany(usersToAdd);
            successfullyAdded.push(...insertedUsers);
        }

        res.status(200).json({
            addedCount: successfullyAdded.length,
            failedCount: failedUsers.length,
            totalUsers: await User.countDocuments({ listId }),
            failedUsers
        });
    } catch (error) {
        console.error('Error processing CSV:', error);
        next(error);
    }
     finally {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
    }
};


const deleteAllUsers = async (req, res) => {
    try {
        await User.deleteMany();
        res.status(200).json({ message: 'All users deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting users' });
    }
};

const deleteAllList = async(req,res)=>{
    try {
        await List.deleteMany();
        res.status(200).json({ message: 'All Lists deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting lists' });
    }
}



module.exports = {
    createList,
    uploadUsers,
    getAllUsers,
    getAllList,
    deleteAllList,
    deleteAllUsers
};
