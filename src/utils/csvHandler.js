const csvParser = require('csv-parser');
const fs = require('fs');

const parseCSV = (filePath, customProperties) => {
    return new Promise((resolve, reject) => {
        const users = [];
        const errors = [];

        const stream = fs.createReadStream(filePath);
        stream.on('error', (error) => {
            reject(error);
        });

        stream.pipe(csvParser())
            .on('data', (row) => {
                let user = {};
                user.name = row.Name;
                user.email = row.Email;
                if (!user.name || !user.email) {
                    errors.push({ row, error: 'Missing required fields' });
                    return;
                }

                customProperties.forEach(prop => {
                    user[prop.title] = row[prop.title] || prop.defaultValue;
                });

                users.push(user);
            })
            .on('end', () => {
                resolve({ users, errors });
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

module.exports = {
    parseCSV
};
