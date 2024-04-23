const socket = io();

const clientsTotal = document.getElementById("client-total");
const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

socket.on("clients-total", (data) => {
  clientsTotal.innerText = `Active Clients: ${data}`;
});

socket.on("chat-message", (data) => {
  addMessageToUI(false, data); // Pass false for isOwnMessage
});

socket.on("feedback", (data) => {
  clearFeedback();
  const element = `
    <li class="message-feedback">
      <p class="feedback" id="feedback">${data.feedback}</p>
    </li>
  `;
  messageContainer.innerHTML += element;
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

function sendMessage() {
  const userName = nameInput.value.trim();

  if (userName === "") {
    alert("Please enter your name first!");
    return;
  }

  if (messageInput.value === "") return;

  const data = {
    name: userName,
    message: messageInput.value,
    dateTime: new Date(),
  };

  socket.emit("message", data);

  // Do not add the new message to the UI here, it will be added when received from the server

  messageInput.value = "";
}

function addMessageToUI(isOwnMessage, data) {
  const messageContainer = document.getElementById("message-container");

  const messageClass = isOwnMessage ? "own-message" : "other-message";
  const messageAlignment = isOwnMessage ? "right" : "left"; // Change alignment based on isOwnMessage

  const messageContent = `
    <li class="message ${messageClass}" style="text-align: ${messageAlignment};">
      <p class="message-content">
        ${data.message}
        <br>
        <span class="message-info">${data.name} ● ${moment(
    data.dateTime
  ).fromNow()}</span>
      </p>
    </li>
  `;

  messageContainer.innerHTML += messageContent;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

function clearFeedback() {
  const feedbackElements = document.querySelectorAll(".message-feedback");
  feedbackElements.forEach((element) => {
    element.remove();
  });
}

messageInput.addEventListener("focus", (e) => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("keypress", (e) => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("blur", (e) => {
  socket.emit("feedback", {
    feedback: "",
  });
});

// Function to load previous messages when the page loads
function loadMessages() {
  fetch("/api/messages") // Fetch messages from your API endpoint
    .then((res) => res.json())
    .then((data) => {
      data.forEach((message) => {
        addMessageToUI(false, message); // Pass false for isOwnMessage
      });
    })
    .catch((err) => console.error("Error fetching messages:", err));
}

// Call the loadMessages function when the page loads
loadMessages();

function addMessageToUI(isOwnMessage, data) {
  const messageContainer = document.getElementById("message-container");

  const messageClass = isOwnMessage ? "own-message" : "other-message";
  const messageAlignment = isOwnMessage ? "left" : "right";

  const messageContent = `
    <li class="message ${messageClass}" style="text-align: ${messageAlignment};">
      <p class="message-content">
        ${data.message}
               <br> <span class="message-info">${data.name} ● ${moment(
    data.dateTime
  ).fromNow()}</span>
      </p>
    </li>
  `;

  messageContainer.innerHTML += messageContent;
  scrollToBottom();
}
