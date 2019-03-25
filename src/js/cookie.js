window.addEventListener("load", function(){
    window.cookieconsent.initialise({
        "palette": {
            "popup": {
                "background": "#eaf7f7",
                "text": "#5c7291"
            },
            "button": {
                "background": "#56cbdb",
                "text": "#ffffff"
            }
        },
        "showLink": false,
        "theme": "classic",
        "content": {
            "message": "Ce site utilise les cookies pour fonctionner correctement.",
            "dismiss": "Compris !"
        }
    })
});