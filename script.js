var responseFile;

class Näytös {
    constructor(index, title, imagesrc, length, language, genres, ticketsURL){
        this.index = index;
        this.title = title;
        this.image = imagesrc;
        this.startingtime = [];
        this.length = length;
        this.language = language;
        this.genres = genres;
        this.tickets = ticketsURL;
    }

    lisääKellonaika(startingTime){
        this.startingtime.push(startingTime);
    }
}

document.getElementById("getData").addEventListener("click", loadDoc);

document.getElementById("location").addEventListener("keypress", submitWithEnter);
document.getElementById("whatDay").addEventListener("keypress", submitWithEnter);

function loadDoc() {
    var xhr = new XMLHttpRequest;

    var location = getLocation();
    var date = todaysDate();

    xhr.open("GET", "https://www.finnkino.fi/xml/Schedule/?area=" + location + "&dt=" + date, true);
    xhr.send();

    xhr.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            responseFile = xhr.responseXML;
            getInfo();
        }
    }
}

function getLocation(){
    var select = document.getElementById('location');
    var value = select.options[select.selectedIndex].value;
    var id = 0;
    console.log(value);

    switch (parseInt(value)) {
        case 1:
            id = 1045;
            break;
        case 2:
            id = 1031;
            break;
        case 3:
            id = 1032;
            break;
        case 4:
            id = 1033;
            break;
        default:
            
    }

    return id;
}

function todaysDate(){
    var select = document.getElementById('whatDay');
    var value = select.options[select.selectedIndex].value;

    //Kokoaa päivän muotoa DD.MM.YYYY
    const d = new Date();

    var päivä = d.getDate();
    var kuukausi = d.getMonth();
    var vuosi = d.getFullYear();
    var päiväys;

    kuukausi = parseInt(kuukausi) + 1;

    switch(parseInt(value)){
        case 1:
            päiväys = päivä + "." + kuukausi + "." + vuosi;
            break;
        case 2:
            päiväys = parseInt(päivä)+1 + "." + kuukausi + "." + vuosi;
            break;
        case 3:
            päiväys = parseInt(päivä)+2 + "." + kuukausi + "." + vuosi;
            break;
    }

    console.log(päiväys);

    document.getElementById("whatDate").innerHTML = "Näytökset: " + päiväys;
    document.getElementById("whatDate").className = "";

    return päiväys;
}

function getInfo(){
    document.getElementById("movies").innerHTML = "";
    //Searching specific movies
    var movies = responseFile.getElementsByTagName("Show");

    var screenings = [];

    for(var i = 0; i < movies.length; i++){
        var movie = movies[i];

        //Getting the title
        var title = movie.getElementsByTagName("Title")[0];
        var otsikko = title.innerHTML; //Getting the title as text only

        //Searching for the movie posters
        var images = movie.getElementsByTagName("Images")[0];
        //Getting the right sized poster
        var poster = images.getElementsByTagName("EventMediumImagePortrait")[0];
        var portrait = poster.innerHTML; //Getting the text only (the url inside that tagname)

        var language = movie.getElementsByTagName("SpokenLanguage")[0];
        var kieli = language.innerHTML;

        var showtime = movie.getElementsByTagName("dttmShowStart")[0];
        var alku = showtime.innerHTML;
        alku = " " + alku.slice(11, alku.length-3);
        
        var genre = movie.getElementsByTagName("Genres")[0];
        var laji = genre.innerHTML;

        var movielength = movie.getElementsByTagName("LengthInMinutes")[0];
        var kesto = movielength.innerHTML;

        var tickets = movie.getElementsByTagName("EventURL")[0];
        var liput = tickets.innerHTML;

        let duplicate_movie = false;

        for(let i = 0; i < screenings.length; i++){
            if (screenings[i].title == otsikko){
                duplicate_movie = true; 
                screenings[i].lisääKellonaika(alku);
                break;
            }
        }
        
        if (duplicate_movie != true) {
            let new_screening = new Näytös(i, otsikko, portrait, kesto, kieli, laji, liput);
            new_screening.lisääKellonaika(alku);
            screenings.push(new_screening);
        }
    }

    displayMovies(screenings);
}

function displayMovies(screenings){
    var näytökset = screenings;

    for(let i = 0; i < näytökset.length; i++){
        var elokuva = näytökset[i];

        var container = document.getElementById("movies");

        var show = document.createElement("div");
            show.id = "movie" + elokuva.i;
            show.className = "grid-item row";
        container.appendChild(show);

        var col12 = document.createElement("div");
            col12.className = "col-sm-12 col12";
        show.appendChild(col12);

        var title = document.createElement("h5");
            title.innerHTML = elokuva.title;
        col12.appendChild(title);

        var col1 = document.createElement("div");
            col1.className = "col-sm-4 col1";
        show.appendChild(col1);

        var col2 = document.createElement("div");
            col2.className = "col-sm-8 col2";
        show.appendChild(col2);

        var image = document.createElement("img");
            image.src = elokuva.image;
        col1.appendChild(image);

        var startingTime = document.createElement("p");
            startingTime.innerHTML = "Aloitusajat:"+ elokuva.startingtime; 
        col2.appendChild(startingTime);

        var length = document.createElement("p");
            length.innerHTML = "Kesto: " + elokuva.length + " min";
        col2.appendChild(length);

        var language = document.createElement("p");
            language.innerHTML = "Kieli: " + elokuva.language;
            language.className = "kieli";
        col2.appendChild(language);

        var genre = document.createElement("p");
            genre.innerHTML = "Tyylilaji: " + elokuva.genres;
        col2.appendChild(genre);

        var tickets = document.createElement("a");
            tickets.href = elokuva.tickets;
            tickets.innerHTML = "LIPUT";
            tickets.target = "_blank";
        col2.appendChild(tickets);
    }
}

function submitWithEnter(enter){
    //If the key is not "Enter" then the code will not process
    if(enter.key != "Enter"){
        return;
    }

    enter.preventDefault();
    document.getElementById("getData").click();
    document.getElementById("whatDay").click(); //Simulates a mouse click on "Submit"-button
}