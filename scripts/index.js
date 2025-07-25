const messageContaner = document.querySelector('.messages');
const messageInput = document.getElementById("input__message");
const btn_clients_online = document.getElementById('clients_online'); //Cliens menu online
const userNameInput = document.getElementById("input__login__user__name");

const HOST = 'https://crisnet-chatbox.onrender.com';

/*const PORT = 8080;
const HOST = 'localhost';
*/

let websocket;
const client = { id: "", name: "", type: '' };
const client_message = { type: "", content: "" };

let typingTimer; //For store Time


const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight + 200,
        behavior: "smooth"
    });
}

const isWrite = () => {
    messageInput.addEventListener("input", () => {
        if (messageInput.value) {
            document.getElementById("chat__btn__start__recorder__audio").style.display = 'none'; //Para esconder ou mostrar o botao de enviar menssagem ou audio
            document.getElementById("btn__send__message").style.display = 'block'; //Para esconder ou mostrar o botao de enviar menssagem ou audio
            const data = { name: userNameInput.value, type: "isWrite", isWrite: true };
            websocket.send(JSON.stringify(data));
        }
        else {
            document.getElementById("chat__btn__start__recorder__audio").style.display = 'block'; //Para esconder ou mostrar o botao de enviar menssagem ou audio
            document.getElementById("btn__send__message").style.display = 'none'; //Para esconder ou mostrar o botao de enviar menssagem ou audio
        }
    });
}


const createMessageSelfElement = (type, content) => {
    const img = document.createElement('img');
    const div = document.createElement('div');
    const span = document.createElement('span');

    div.classList.add("message__self");

    switch (type) {
        case "text":
            span.textContent = "Eu";
            div.textContent = content;
            div.appendChild(span);
            break;

        case "image":
            span.textContent = "Eu";
            if (content) img.src = content;
            else alert("URL da imagem inválida!");

            div.appendChild(img);
            div.appendChild(span);
            break;

        default:
            break;
    }
    return div; //Return element
}

const createMessageOtherElement = (name, type, content) => {
    const img = document.createElement('img');
    const div = document.createElement('div');
    const span = document.createElement('span');

    div.classList.add("message__other");

    switch (type) {
        case "text":
            span.textContent = name;
            div.textContent = content;
            div.appendChild(span);
            document.getElementById("is__write").style.visibility = "hidden"; //Para remover o indicador esta escrevendo quando a menssagem é enviada
            break;

        case "image":
            span.textContent = name;
            if (content) img.src = content;
            else alert("URL da imagem inválida!");

            div.appendChild(img);
            div.appendChild(span);
            break;

        default:
            break;
    }
    return div; //Return element
}

const sendMessage = (event) => {
    event.preventDefault();

    const data = {
        id: client.id,
        name: client.name,
        type: "text",
        content: messageInput.value,
        isWrite: false //For say that the message is send
    };

    websocket.send(JSON.stringify(data));

    messageInput.value = "";
    messageContaner.appendChild(createMessageSelfElement(data.type, data.content));
    scrollScreen();

    document.getElementById("chat__btn__start__recorder__audio").style.display = 'block';   //Para esconder ou mostrar o botao de enviar menssagem ou audio
    document.getElementById("btn__send__message").style.display = 'none'; //Para esconder ou mostrar o botao de enviar menssagem ou audio
}

const sendImage = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    //const imageURL = URL.createObjectURL(file);

    const reader = new FileReader();

    reader.onload = () => {
        const base64 = reader.result;
        const data = {
            name: client.name,
            type: 'image',
            content: base64
        }
        websocket.send(JSON.stringify(data));
        messageContaner.appendChild(createMessageSelfElement(data.type, data.content));
        scrollScreen();
    }

    reader.readAsDataURL(file);
}

const processMessage = ({ data }) => {
    const { id, name, type, content, isWrite, client_counter, clients_name } = JSON.parse(data);

    //Render counter clients connected
    if (client_counter !== undefined) {
        document.getElementById('clients_online').textContent = `${client_counter} online`;
    }

    //Rendering list names clients connected
    if (clients_name) {
        document.querySelector('.clients_menu_conected ul').textContent = ''; //For update list
        clients_name.forEach(element => {
            if (element !== client.name) {
                const li = document.createElement('li');
                const span = document.createElement('span');

                li.textContent = element;
                li.appendChild(span);

                document.querySelector('.clients_menu_conected ul').appendChild(li);
            }
        });
    }


    if (name && type && content) {
        messageContaner.appendChild(createMessageOtherElement(name, type, content));
        scrollScreen();
    }

    /* IF is write render the indicator*/
    if (isWrite) {
        document.querySelector(".is__write #name").textContent = name;
        document.getElementById("is__write").style.visibility = "visible";

        clearTimeout(typingTimer); //Clear time for repeat counter

        typingTimer = setTimeout(() => {
            document.getElementById("is__write").style.visibility = "hidden";
        }, 1500);
    }
}

const handleLogin = (event) => {
    event.preventDefault();

    client.id = Math.floor(Math.random() * 1024) + "edrp84ur" + Math.floor(Math.random() * 1000); //crypto.randomUUID();
    client.name = userNameInput.value;
    client.type = 'login';

    localStorage.setItem("@clientData", JSON.stringify({ name: client.name })); //To store name

    websocket = new WebSocket(`${HOST}`);
    websocket.onopen = () => websocket.send(JSON.stringify(client)); //IF the connection is Open send UserData
    websocket.onmessage = processMessage; //Passa as menssagens na function processMessage

    document.querySelector(".section__login").style.display = "none";
    document.querySelector(".chat-contaner").style.display = "flex";
}

/* For store Name of client */
let data = JSON.parse(localStorage.getItem("@clientData"));
if (data) userNameInput.value = data.name;

isWrite(); //Call the function isWrite()

document.querySelector(".login__form").addEventListener('submit', handleLogin);
document.querySelector(".chat__form").addEventListener('submit', sendMessage);
document.querySelector("#input__file").addEventListener('change', sendImage);
document.querySelector("#btn__open__menu").addEventListener("click", () => document.querySelector(".menu").classList.toggle("open"));
btn_clients_online.addEventListener("click", () => document.querySelector('.clients_menu_conected').classList.add('open')); //Open The menu clients connected
document.querySelector('#btn_close_menu_clients').addEventListener("click", () => document.querySelector('.clients_menu_conected').classList.remove('open')); //Open The menu clients connected

//document.querySelector("#stop__recorder").addEventListener("click", StopRecordAudio); //Feature
//document.querySelector("#btn__start__recorder__audio").addEventListener("click", StartRecordAudio); //Feature
document.querySelector("#icon__file").addEventListener("click", () => alert('Esta opção ainda esta em desenvolvimento')); //Feature
document.querySelector("#icon__video").addEventListener("click", () => alert('Esta opção ainda esta em desenvolvimento')); //Feature
document.querySelector("#chat__btn__start__recorder__audio").addEventListener("click", () => alert('Esta opção ainda esta em desenvolvimento')); //Feature
