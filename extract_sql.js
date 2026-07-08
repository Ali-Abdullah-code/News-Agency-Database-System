const fs = require('fs');
const doc = fs.readFileSync('g:/News-Agency-Database-System/NAMS_Project_Document.md', 'utf8');

// Helper to extract sql blocks under a certain heading prefix
function extractSection(headingPrefix) {
    let lines = doc.split('\n');
    let insideSection = false;
    let insideSql = false;
    let result = '';

    for (let line of lines) {
        if (line.startsWith('## ')) {
            insideSection = line.startsWith(headingPrefix);
        }

        if (insideSection) {
            if (line.startsWith('```sql')) {
                insideSql = true;
                continue;
            } else if (line.startsWith('```') && insideSql) {
                insideSql = false;
                result += '\n';
                continue;
            }

            if (insideSql) {
                result += line + '\n';
            }
        }
    }
    return result;
}

const dataSql = extractSection('## 6. Data Population');
fs.writeFileSync('g:/News-Agency-Database-System/nams-project/sql/03_data.sql', dataSql);

const queriesSql = extractSection('## 7. Advanced SQL Queries');
fs.writeFileSync('g:/News-Agency-Database-System/nams-project/sql/04_queries.sql', queriesSql);

const plsql = extractSection('## 8. PL/SQL');
fs.writeFileSync('g:/News-Agency-Database-System/nams-project/sql/05_plsql.sql', plsql);

console.log('Extraction complete');
