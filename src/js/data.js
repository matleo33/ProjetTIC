let ingredients = [];//Liste de tableau de produit
const cookieProduits = 'cookieProduits';//nom du cookie

/**
 * Utilise l'api OpenFoodFact pour récupérer les informations du produit correspondant au code barre saisie
 * Et ajoute le produit à notre liste d'ingrédient avec la fonction addToIngredients
 * @param barcode
 * @param expirationDate
 */
function searchProduct(barcode, expirationDate) {
  // Codes barre : '3272770098090', '3302745733029', '3270190207689'
  //Check le code barre
  let query = 'https://fr.openfoodfacts.org/api/v0/produit/' + barcode + '.json';

  $.getJSON(query, function(data) {
    if (data.status_verbose === 'product found') {
      let product = [];
      product['name'] = data.product.product_name_fr; //product_name si rien trouvé ?
      product['quantityUnit'] = data.product.quantity; //product_quantity selon l'usage (ou l'api marmiton)
      product['quantity'] = data.product.product_quantity;
      product['expirationDate'] = changeDateFormat(expirationDate);
      product['barCode'] = barcode;
      addToIngredients(product);
    }
    document.getElementById('ajoutIngredient').reset();
  });
}
/**
 * Converti une date au format français
 * @param date
 * @returns {string}
 */
function changeDateFormat(date) {
  function pad(s) {
    return s < 10 ? '0' + s : s;
  }
  let d = new Date(date);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
}
/**
 * Calcule la nouvelle quantité souhaité et retourne les informations
 * @param quantity
 * @param exQuantityUnit
 * @param exQuantity
 * @param operation
 * @returns {Array}
 */
function operationIngredients(quantity, exQuantityUnit, exQuantity, operation) {
  let unity = exQuantityUnit.replace(exQuantity, '');
  let newQuantity = [];
  let hasError = false;
  switch (operation) {
    case '+':
      newQuantity['quantity'] = quantity + exQuantity;
      break;
    case '-':
      newQuantity['quantity'] = quantity - exQuantity;
      break;
    case '=':
      newQuantity['quantity'] = quantity;
      break;
    default:
      hasError = true;
      break;
  }
  if (!hasError) {
    newQuantity['quantityUnit'] = newQuantity['quantity'].toString() + unity;
  }
  return newQuantity;
}
/**
 * NON UTILISE
 * @param barcode
 * @param expirationDate
 * @param quantity
 */
function removeQuantity(barcode, expirationDate, quantity) {
  let find = ingredients.find(function(prod) {
    return prod['barcode'] === barcode && prod['expirationDate'] === expirationDate;
  });
  if (find !== undefined) {
    let quantity = document.getElementById('quantiteASuppr');
    let newQuantity = operationIngredients(quantity, find['quantityUnit'], find['quantity'], '-');
    if (newQuantity['quantity'] <= 0) {
      ingredients.splice(find);
    } else {
      find['quantityUnit'] = newQuantity['quantityUnit'];
      find['quantity'] = newQuantity['quantity'];
    }
  }
}
/**
 * Met à jour la quantité du produit passé en paramètre.
 * Cherche le produit dans notre liste d'ingrédients
 * Si, il est trouvé, on modifie la quantité.
 * Si, la quantité entrée est infèrieur à 0, on supprime le produit
 * On réécrit en même temps le cookie
 * @param product
 * @param quantity
 */
function updateQuantity(product, quantity) {
  let find = ingredients.find(function(prod) {
    return prod['barcode'] === product['barcode'] && prod['expirationDate'] === product['expirationDate'];
  });
  if (find !== undefined) {
    let newQuantity = operationIngredients(quantity, find['quantityUnit'], find['quantity'], '=');
    if (newQuantity['quantity'] <= 0) {
      ingredients.splice(find);
    } else {
      find['quantityUnit'] = newQuantity['quantityUnit'];
      find['quantity'] = newQuantity['quantity'];
    }
  }
  writeCookie();
  display();
}
/**
 * Ajouter un produit à notre liste d'ingrédients
 * Si, un produit avec la même date d'expiration et le même nom existe, on va juste modifier sa quantité.
 * On modifie le cookie au passage
 * @param product
 */
function addToIngredients(product) {
  let find = ingredients.find(function(prod) {
    return (
      prod['name'] === product['name'] &&
      prod['expirationDate'] === product['expirationDate'] &&
      product['expirationDate'] !== ''
    );
  });
  if (find === undefined) {
    ingredients.push(product);
  } else {
    let newQuantity = operationIngredients(product['quantity'], find['quantityUnit'], find['quantity'], '+');
    find['quantityUnit'] = newQuantity['quantityUnit'];
    find['quantity'] = newQuantity['quantity'];
  }
  writeCookie();
}
/**
 * Supprime le produit voulu de notre liste d'ingrédients
 * Update le cookie
 * Met à jour les notifications indiquant les produits périmées
 * @param product
 */
function supprIngredient(product) {
  let find = ingredients.find(function(prod) {
    return (
      prod['name'] === product['name'] &&
      prod['expirationDate'] === product['expirationDate'] &&
      product['expirationDate'] !== ''
    );
  });
  if (find !== undefined) {
    ingredients.splice(ingredients.indexOf(find), 1);
  }
  writeCookie();
  display();
  getNotifications();
}
/**
 * Crée le tableau qui va contenir tout les produits de notre liste d'ingrédients
 * Les fonctions des boutons permettant de supprimer ou mettre à jour la quantité sont aussi défini dans cette fonction
 */
function display() {
  if (ingredients.length !== 0) {
    let tabIngredients = document.getElementById('divIngredients');

    if (document.getElementById('tabIngredients') !== null) {
      tabIngredients.removeChild(document.getElementById('tabIngredients'));
      tabIngredients.removeChild(document.getElementById('titleIngredients'));
    }

    let title = document.createElement('h1');
    title.id = 'titleIngredients';
    title.innerText = 'Mes produits';
    title.className = 'centered';
    tabIngredients.appendChild(title);

    let divTable = document.createElement('div');
    divTable.id = 'divTable';
    divTable.className = 'table-responsive';
    tabIngredients.appendChild(divTable);

    let table = document.createElement('table');
    table.id = 'tabIngredients';
    table.className = 'table-striped table-bordered';
    divTable.appendChild(table);

    let thead = document.createElement('thead');
    table.classList.add('table');
    table.appendChild(thead);

    let trHead = document.createElement('tr');
    thead.appendChild(trHead);

    let tdProduct = document.createElement('td');
    tdProduct.innerText = 'Produits';
    trHead.appendChild(tdProduct);

    let tdQuantity = document.createElement('td');
    tdQuantity.innerText = 'Quantité';
    trHead.appendChild(tdQuantity);

    let tdExpirationDate = document.createElement('td');
    tdExpirationDate.innerText = 'Date de péremption';
    trHead.appendChild(tdExpirationDate);

    let tdAction = document.createElement('td');
    tdAction.innerText = 'Action';
    trHead.appendChild(tdAction);

    let tbody = document.createElement('tbody');
    table.appendChild(tbody);

    //Parcours de notre liste d'ingrédients pour créer chaque lignes correspondante dans le tableau
    ingredients.forEach(function(product) {
      let trBody = document.createElement('tr');
      trBody.dataset.barcode = product['barCode'];
      trBody.dataset.expirationdate = product['expirationDate'];
      tbody.appendChild(trBody);

      let tdName = document.createElement('td');
      tdName.innerText = product['name'];
      trBody.appendChild(tdName);

      let tdQuantity = document.createElement('td');
      tdQuantity.innerText = product['quantityUnit'];
      trBody.appendChild(tdQuantity);

      let tdPeremp = document.createElement('td');
      tdPeremp.innerText = product['expirationDate'];
      trBody.appendChild(tdPeremp);

      let tdAction = document.createElement('td');
      let buttonSuppr = document.createElement('button');
      buttonSuppr.className = 'btn btn-primary';
      buttonSuppr.style.margin = '0px 10px 2px 0px';
      buttonSuppr.innerText = 'Supprimer';

      //fonction permettant de supprimer un produit du tableau
      buttonSuppr.onclick = function() {
        supprIngredient(product);
      };

      tdAction.appendChild(buttonSuppr);
      let buttonUpdate = document.createElement('button');
      buttonUpdate.innerText = 'Modifier';
      buttonUpdate.className = 'btn btn-primary';
      //Fonction permettant de modifier et confirmer la modification de la quantité
      buttonUpdate.onclick = function() {
        buttonUpdate.innerText = 'Valider';
        var input = document.createElement('input');
        var tmp = tdQuantity;
        input.innerHTML = tdQuantity.innerHTML;
        input.type = 'number';
        input.value = product['quantity'];
        input.min = 0;
        tdQuantity.parentNode.replaceChild(input, tdQuantity);
        buttonUpdate.onclick = function() {
          updateQuantity(product, parseInt(input.value));
          tdQuantity.innerHTML = tmp.innerHTML;
          buttonUpdate.innerText = 'Modifier';
        };
      };
      tdAction.appendChild(buttonUpdate);
      trBody.appendChild(tdAction);
    });
  } else {
    if (document.getElementById('tabIngredients') !== null) {
      document.getElementById('divIngredients').removeChild(document.getElementById('tabIngredients'));
      document.getElementById('divIngredients').removeChild(document.getElementById('titleIngredients'));
    }
  }
}

/**
 * Création et modification du cookie contenant toutes les modifications effectuer lors de l'utilisation de l'application
 */
function writeCookie() {
  let cookieContent = cookieProduits;
  let separator = '#';
  let separatorProduct = '\\';
  cookieContent += '=';
  ingredients.forEach(function(product) {
    cookieContent +=
      product['name'] +
      separator +
      product['quantityUnit'] +
      separator +
      product['quantity'] +
      separator +
      product['expirationDate'] +
      separator +
      product['barCode'] +
      separatorProduct;
  });

  document.cookie = cookieContent;
}
/**
 * Lis le cookie au chargement de la page pour afficher tout les produits de la dernière utilisation
 */
window.onload = function readCookie() {
  let cookie = getCookie(cookieProduits);
  if (cookie !== '') {
    let product = cookie.split('\\');
    product.forEach(function(prod) {
      if (prod !== '') {
        let detail = prod.split('#');
        let product = [];
        product['name'] = detail[0];
        product['quantityUnit'] = detail[1];
        product['quantity'] = parseInt(detail[2]);
        product['expirationDate'] = detail[3];
        product['barCode'] = parseInt(detail[4]);
        ingredients.push(product);
      }
    });
    display();
    getNotifications();
  }
};
/**
 * Récupére la chaine se trouvant après le nom du cookie
 * EXemple : Si le 'produits=pomme,300g' va retourner la chaîne "pomme,300g"
 * @param cookieName
 * @returns {string}
 */
function getCookie(cookieName) {
  let allCookies = document.cookie;
  let splitedCookie = allCookies.split(';');
  let cookie = '';
  splitedCookie.forEach(function(cookieIt) {
    if (cookieIt.includes('=')) {
      let cookieContent = cookieIt.split('=');
      if (cookieContent[0] === cookieName) {
        cookie = cookieContent[1];
      }
    }
  });
  return cookie;
}
/**
 * Retourne une liste de tableau contenant les informations des produits dont la date d'expirations se termine dans 2 jours ou moins, y compris les jours négatifs
 * @returns {Array}
 */
function getExpirationsDate() {
  let expirationDates = [];
  let today = '';
  let d = new Date();
  today += d.getFullYear();
  today += '/';
  today += d.getMonth() + 1;
  today += '/';
  today += d.getDate();

  let dateToday = new Date(today);
  ingredients.forEach(function(produit) {
    let dateToR = produit['expirationDate'];
    let values = dateToR.split('/');
    dateToR = values[1] + '/' + values[0] + '/' + values[2];
    let dateExpiration = new Date(dateToR);
    let timeDiff = Math.abs(dateExpiration.getTime() - dateToday.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (dateExpiration.getTime() < dateToday.getTime()) {
      diffDays = diffDays * -1;
    }
    if (diffDays <= 2) {
      let product = [];
      product['ingredient'] = produit['name'];
      product['expirationDate'] = produit['expirationDate'];
      product['daysLeft'] = diffDays;
      expirationDates.push(product);
    }
  });
  return expirationDates;
}
/**
 * Crée le badge rouge d'informations du nombre de produit périmé
 * Créé le texte indiquant, lors du clique sur le bouton de notification, quels produits vont arriver  à écheance, ainsi que le nombre de jour avant celle-ci.
 * @param expirationDates
 */
function displayNotifications(expirationDates) {
  let divNotification = document.getElementById('dropdownNotifications');
  let nbNotifs = 0;

  let dropdownMenu = document.createElement('div');
  dropdownMenu.classList.add('dropdown-menu');
  dropdownMenu.classList.add('dropdown-menu-right');
  divNotification.appendChild(dropdownMenu);

  expirationDates.forEach(function(dates) {
    let notif = document.createElement('a');
    notif.classList.add('dropdown-item');
    notif.setAttribute('href', '#');
    let message = '';
    if (dates['daysLeft'] < 0) {
      message = dates['ingredient'] + ' périmé depuis ' + Math.abs(dates['daysLeft']) + ' jour(s)';
      nbNotifs++;
    } else if (dates['daysLeft'] === 0) {
      message = dates['ingredient'] + " périme aujourd'hui";
      nbNotifs++;
    } else if (dates['daysLeft'] <= 2) {
      message = dates['ingredient'] + ' périmé dans ' + dates['daysLeft'] + ' jour(s)';
      nbNotifs++;
    }
    notif.innerText = message;
    let buttonNotifications = document.getElementById('dropdownNotifications');
    if (nbNotifs !== 0) {
      let lastButtonBadge = buttonNotifications.getElementsByClassName('button_badge')[0];
      if (lastButtonBadge) {
        buttonNotifications.removeChild(lastButtonBadge);
      }

      let showNotifs = document.createElement('span');
      showNotifs.classList.add('button_badge');
      showNotifs.innerText = nbNotifs.toString();
      buttonNotifications.appendChild(showNotifs);
    }
    dropdownMenu.appendChild(notif);
  });
}
/**
 * Gestion des notifications des produits périmés
 */
function getNotifications() {
  let expirationDates = getExpirationsDate();
  if (expirationDates !== []) {
    displayNotifications(expirationDates);
  }
  if (expirationDates.length === 0) {
    if (document.getElementById('dropdownNotifications').getElementsByClassName('button_badge')[0] !== null) {
      document
        .getElementById('dropdownNotifications')
        .removeChild(document.getElementById('dropdownNotifications').getElementsByClassName('button_badge')[0]);
    }
  }
}

/* ARRAY TO CSV
SOURCE : https://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/*/
function convertArrayOfObjectsToCSV(args) {
  var result, ctr, keys, columnDelimiter, lineDelimiter, data;

  data = args.data || null;
  if (data == null || !data.length) {
    return null;
  }

  columnDelimiter = args.columnDelimiter || ';';
  lineDelimiter = args.lineDelimiter || '\n';

  keys = Object.keys(data[0]);

  result = '';
  result += keys.join(columnDelimiter);
  result += lineDelimiter;

  data.forEach(function(item) {
    ctr = 0;
    keys.forEach(function(key) {
      if (ctr > 0) result += columnDelimiter;

      result += item[key];
      ctr++;
    });
    result += lineDelimiter;
  });

  return result;
}
/**
 * Télécharger la liste d'ingrédient au format CSV pour sauvegarder les données contenues
 * @param args
 * SOURCE = https://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/
 */
function downloadCSV(args) {
  var data, filename, link;
  var csv = convertArrayOfObjectsToCSV({
    data: ingredients,
  });
  if (csv == null) return;
  filename = args.filename || 'export.csv';

  if (!csv.match(/^data:text\/csv/i)) {
    csv = 'data:text/csv;charset=utf-8,' + csv;
  }
  data = encodeURI(csv);

  link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
