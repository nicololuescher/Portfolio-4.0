let entities = [];
let inactives = [];
let canvas

density = 11
spacing = 20

imgURL = [
    "res/css.png",
    "res/html.png",
    "res/javascript.png",
    "res/typescript.png",
    "res/linux.png",
    "res/mqtt.png",
    "res/node.png",
    "res/python.png",
    "res/sql.png",
    "res/java.png",
    "res/git.png",
    "res/fusion.png",
    "res/powershell.png",
    "res/vs.png",
    "res/c.png",
]

function preload() {
    let shuffled = []

    for (let i = 0; i < Math.floor(window.innerWidth / 350); i++) {
        let randomIndex = Math.floor(Math.random() * imgURL.length)
        shuffled.push(imgURL[randomIndex])
        imgURL.splice(randomIndex, 1)
    }

    images = shuffled.map(url => loadImage(url));
}

function setup() {
    let elements = document.querySelectorAll(".postLoading");
    elements.forEach(element => {
        element.style.opacity = "1"
    });

    if (window.innerWidth < 1200) {
        noLoop();
        return;
    }

    canvas = createCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
    canvas.clear();
    noStroke();
    images.forEach(img => img.loadPixels());
    frameRate(30)

    canvasContainer = document.getElementById("canvasContainer")

    new ResizeObserver(() => { resizeCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight) }).observe(canvasContainer);

    images.forEach(img => {
        let group = [];

        let notValid = true
        let position

        positionTitle = document.getElementById("titleContainer").getBoundingClientRect()
        counter = 0

        while (notValid) {
            counter++
            position = createVector(random(50, width - 150), random(50, height - 150));
            notValid = false

            if (position.x < positionTitle.right + 100 && position.y < positionTitle.bottom + 100) {
                notValid = true
            }
            inactives.forEach(inactive => {
                if (
                    position.x > inactive.boundry.x - inactive.boundry.width * 2 &&
                    position.x < inactive.boundry.x + inactive.boundry.width * 2 &&
                    position.y > inactive.boundry.y - inactive.boundry.height * 2 &&
                    position.y < inactive.boundry.y + inactive.boundry.height * 2
                ) {
                    notValid = true
                }
            })
            if (counter > 30) {
                console.log("failed to place elements");
                notValid = false
            }
        }


        for (let i = 0; i < density; i++) {
            for (let j = 0; j < density; j++) {
                let x = i
                let y = j
                pixel = img.pixels.slice(y * 4 * img.width + x * 4, y * 4 * img.width + x * 4 + 4);
                if (pixel[3] < 100) {
                    continue;
                }
                group.push(new Entity(createVector(position.x + i * spacing, position.y + j * spacing), color(pixel[0], pixel[1], pixel[2])));
            }
        }
        inactives.push({ group: group, boundry: { x: position.x, y: position.y, width: density * spacing, height: density * spacing } });
    });

    canvas.parent("canvasContainer");
}

function draw() {
    ;
    if (!isLooping()) {
        console.log("sketch not loaded");
        if (document.cookie != "mobile=true") {
            Swal.fire(
                {
                    icon: 'info',
                    html: 'You seem to be on a mobile device. \nYou should check out the website on a desktop computer. There are some cool things to see',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#1faa00',
                    background: '#1a1a1a',
                    color: '#fff',
                }
            ).then(() => {
                document.cookie = "mobile=true; expires=" + new Date(Date.now() + 1000 * 60 * 60).toUTCString();
            });
        }
        return;
    }
    canvas.clear();
    entities.forEach(entity => {
        entity.group.forEach(pixel => {
            pixel.draw();
            pixel.update(entity.group);
        });
    });

    inactives.slice().reverse().forEach(inactive => {
        inactive.group.forEach(pixel => {
            pixel.draw();
        });
        if (mouseX > inactive.boundry.x && mouseX < inactive.boundry.x + inactive.boundry.width && mouseY > inactive.boundry.y && mouseY < inactive.boundry.y + inactive.boundry.height) {
            entities.push(inactive);
            inactives.splice(inactives.indexOf(inactive), 1);
        }
    });
}

function displayInfo() {
    Swal.fire(
        {
            icon: 'info',
            title: 'What is this?',
            html: '<div class="info">' +
                'This is a little simulation of a flocking algorithm in <a href="https://p5js.org/" target="_blank">p5.js</a>.<br><br>' +
                'The behaviour of the dots is related to how real animals like birds <a href="https://en.wikipedia.org/wiki/Flocking_(behavior)" target="_blank"> flock</a>. <br> PS: They don\'t like your cursor or crashing into walls!<br><br>' +
                'The flocking groups form a logo of a technology I am confident with (refresh the page for more. Can you guess them all?)<br><br>' +
                'It is inspired by a <a href="https://www.youtube.com/watch?v=mhjuuHl6qHM" target="_blank">Coding Train</a> episode by Daniel Shiffman (The person responsible for me becomming a programmer <i class="fa-regular fa-face-smile-beam"></i> ).<br><br>' +
                '</div>',
            confirmButtonText: 'Ok',
            confirmButtonColor: '#1faa00',
            background: '#1a1a1a',
            color: '#fff',
            width: '900px',
        }
    )
}