var inquirer = require('inquirer');
var mysql = require('mysql')
var arrayIDs = [];
var arrayPrices= [];
var selectedId = 0;
var selectedUnits;
var arrayUnits = [];
var cartTotal;
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'bamazon'
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected");
    queryAllProducts();
    connection.end();
});

function queryAllProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        console.log("ID |    Name    |   Dep. Name    | Price | Stock")
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity);
            console.log("-----------------------------------");
            arrayIDs.push(res[i].item_id);
            arrayUnits.push(res[i].stock_quantity);
            arrayPrices.push(res[i].price);
        };
        questions();
    });
};
function questions(){
setTimeout(function () {
    inquirer
        .prompt([{
            type: 'input',
            message: 'What is the ID of the product you would like to buy? ',  //(Hit enter to exit.)
            name: 'buyId'
        }])
        .then(answer => {
            for (var i = 0; i < arrayIDs.length; i++) {
                if (answer.buyId == arrayIDs[i]) {
                    selectedId= answer.buyId
                    inquirer.prompt([{
                        type: 'input',
                        message: 'How many units of this product you would like to buy?',
                        name: 'buyUnits'
                    }]).then(ans => {
                        selectedUnits = (ans.buyUnits);
                        console.log('Total: $' + cartTotal);
                        cartTotal= parseInt(ans.buyUnits * arrayPrices[i]);
                        var update = 'UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?'
                        connection.query(update, [parseInt(selectedUnits), parseInt(selectedId) ], function (err, res, fields) {
                            if (err) {
                                return console.error(err.message);
                            }
                            console.log('connection made #1');
                            console.log('Updating ' + res.affectedRows + ' row...')
                            connection.query("SELECT * FROM products", function (err, res) {
                                console.log('connection made #2');
                                console.log("ID |    Name    |   Dep. Name    | Price | Stock")
                                for (var i = 0; i < res.length; i++) {
                                    console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity);
                                    console.log("-----------------------------------");
                                };
                            });
                        });
                    });
                }
                else {
                    console.log('Insufficient quantity!')
                }
            };
        });
}, 300);
}

