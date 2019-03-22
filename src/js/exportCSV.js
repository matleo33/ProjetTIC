function createAndDownloadFile(text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(JSON.stringify(text)));
  element.setAttribute('download', 'donnees.csv');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function exportCSV() {
  var c = document.cookie;
  createAndDownloadFile(c);
}
