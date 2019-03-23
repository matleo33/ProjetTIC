<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Application - Projet TIC</title>
    <link rel="stylesheet" href="../css/style.css" />
    <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
      integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
      crossorigin="anonymous"
    />
    <script src="../js/data.js"></script>
      <script src="../js/exportCSV.js"></script>
    <script
      src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
      integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
      crossorigin="anonymous"
    ></script>
    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
      integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1"
      crossorigin="anonymous"
    ></script>
    <script
      src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
      integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM"
      crossorigin="anonymous"
    ></script>
  </head>
  <body>
    <nav class="navbar navbar-expand-lg navbar-light">
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarTogglerDemo01"
        aria-controls="navbarTogglerDemo01"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          <li class="nav-item active">
            <a class="nav-link" href="#">Consult produits <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="receipes.html">Recettes</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="addProduct.html" tabindex="-1">Ajout Produit</a>
          </li>
        </ul>
      </div>
    </nav>
  </body>
  <div id="divIngredients" class="container"></div>
  <div>
    <form enctype="multipart/form-data" id="importForm">
      <input type="hidden" name="MAX_FILE_SIZE" value="30000" />
      Envoyez ce fichier : <input name="userfile" type="file" accept=".csv" id="fichier"/>
      <input type="submit" value="Envoyer le fichier" />
    </form>
  </div>
  <div>
    Récupérez vos données sous la forme d'un fichier .csv : 
    <input type="button" onclick="exportCSV(event)" value="Ici">
  </div>
    <div id="fileContents">

    </div>
</html>
<script>
    document.getElementById("importForm").addEventListener("submit", function(event){
        event.preventDefault();
        importCSV();
    });
    function importCSV()
    {
        var file = document.getElementById("fichier").files[0];

        if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                var contenu = evt.target.result;
                //document.getElementById("fileContents").innerHTML = contenu;

                var lignes = contenu.split("\n");
                //console.log(lignes[0]);
                //console.log(lignes[0].split(';'));
                var ligne= [];//contient tout les produits => A SUPPRIMER
                for(var i =0; i<lignes.length;i++)
                {
                     var tmp = lignes[i].split("#");
                     console.log(tmp);
                     var product = [];
                     product['name'] = tmp[0].substr(1);
                     product['quantityUnit'] = tmp[1];
                     product['quantity'] = tmp[2];
                     product['expirationDate'] = tmp[3];
                     product['barCode'] = tmp[4];
                     ligne[i] = product; //A SUPPRIMER
                     addToIngredients(product);
                }
                display();
                //alert(ligne[0]);
            };
            reader.onerror = function (evt) {
                document.getElementById("fileContents").innerHTML = "error reading file";
            }
        }

    }
</script>