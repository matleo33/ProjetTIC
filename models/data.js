class Data {

    static searchProduct(barcode) {
        var query = 'https://fr.openfoodfacts.org/api/v0/produit/' + barcode + '.json';

        $.getJSON(query, function(data) {
            if(data.status_verbose === 'product found') {
                //console.log(data);
                var product = [];
                product["name"] = data.product.product_name_fr; //product_name si rien trouvé ?
                product["quantity"] = data.product.quantity; //product_quantity selon l'usage (ou l'api marmiton)
                //3272770098090 : product_name_fr = "St Moret", product_name = "St Moret" quantity = "150 g", product_quantity = 150

                saveCSV(product);
            } else {
                //error
            }

        });
    }

    static saveCSV(product) {
        let fs = require('fs');
        let src = fs.readFileSync(__dirname + '/file.txt');

        console.log("Test");
    }

    static loadCSV() {

    }

    static readCSV() {

    }

}