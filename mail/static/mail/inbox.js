// window.onpopstate is a built-in event listener in JavaScript that listens for changes in the browser's history. Specifically, it is triggered when the user navigates through their browsing history using the back or forward button, or when the history.back() or history.forward() methods are called in JavaScript.
// The "event" object contains information about the event that triggered the listener, including the state object that was passed to the pushState() method when the user first navigated to the current page.
// The state object is an arbitrary JavaScript object that can be used to store information about the current page state. In this case, the section property of the state object is being accessed and assigned to the section variable.
window.onpopstate = function (event) {
  try {
    section = event.state.section;
    if (section == "compose") {
      compose_email();
    } else {
      load_mailbox(`${section}`);
    }
  } catch (error) {
    // le pusiste este catch porque si ponias hacia atras habiendo ido hacia 1 pagina y debia ir hacia la pagina por defecto te saltaba este error, entonces agarras ese error y le decis que conteste de esta manera.
    if (error instanceof TypeError) {
      // handle the error here
      load_mailbox("inbox");
    }
  }
  // tambien podes poner una ruta por defecto poniendo history.replaceEstate();
};




document.addEventListener("DOMContentLoaded", function () {
  const mailboxButtons = ["#inbox", "#sent", "#archive", "#compose"];

  mailboxButtons.forEach((ID) => {
    // si pones un arrow function no te anda el this.
    document.querySelector(ID).addEventListener("click", function () {
      const section = this.id;
      // Add the current state to the history, esto esta ligado a las primeras lineas de codigo que pusiste
      history.pushState({ section: section }, "", `${section}`);
      if (section == "compose") {
        compose_email();
      } else {
        load_mailbox(`${section}`);
      }
    });
  });

  // form:
  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email(
  recipients = "",
  subject = "",
  body = "",
  respuesta = false
) {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#see-email").style.display = "none";

  // Change navbar active tab
  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.classList.remove("active");
  });
  document.querySelector(`#compose`).classList.add("active");

  if (respuesta === true) {
    document.querySelector("#compose-body").focus();
  } else {
    document.querySelector("#compose-recipients").focus();
  }

  // Clear out composition fields
  if (recipients instanceof PointerEvent) {
    recipients = "";
    // aca entra al if si recipients instancia al contructor PointerEvent y le da el value de "".
    // PointerEvent is a constructor function in JavaScript that is used to create a new instance of the PointerEvent interface. It is not a variable or an object that can be compared to another value using the === operator.
    // If you want to check if the recipients variable is an instance of the PointerEvent interface, you can use the instanceof operator
  }

  document.querySelector("#compose-recipients").value = recipients;
  document.querySelector("#compose-subject").value = subject;
  document.querySelector("#compose-body").value = body;
}

// todo esta función te sirve para poner todo el html y que lo convierta
function elementFromHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  // .trim() borra los espacios
  return template.content.firstElementChild;
}


function load_mailbox(mailbox, operation = "") {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#see-email").style.display = "none";

  // alerts:
  // este placeholder dice donde irá la alerta
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");

  // logica
  const alert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div id="innerdiv" class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
  };


  function playAnimation() {
    document.querySelector("#innerdiv").style.animationPlayState = "running";
  }

  // trigger de alerta, en este caso cuando se haga click en el boton de send
  if (operation === "sent") {
    alert("Your email has been sent successfully!", "success");
    playAnimation()
    
    
  } else if (operation === true) {
    alert("Your email has been archived successfully!", "success");
    playAnimation()
    alertPlaceholder.addEventListener("animationend", () => {
      // document.querySelector("#innerdiv").remove();
      document.querySelector("#innerdiv").parentElement.remove();
    });
    
  
  } else if (operation === false) {
    alert("Your email has been unarchived successfully!", "success");
    playAnimation();
    alertPlaceholder.addEventListener("animationend", () => {
      // document.querySelector("#innerdiv").remove();
      document.querySelector("#innerdiv").parentElement.remove();
    });
  }

  

  // Change navbar active tab
  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.classList.remove("active");
  });
  document.querySelector(`#${mailbox}`).classList.add("active");

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  //todo In JavaScript, single quotes (') and double quotes (") are used to wrap string literals. However, when using template literals, you should use backticks (`) instead.

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((email) => {
        let color_grey = "";
        if (email.read === true) {
          color_grey = 'style="background-color: #bdbdbd"';
        }

        const divEmails = elementFromHtml(`
          <div class="list-group w-auto mb-3">
            <a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true" ${color_grey}>
                <div class="d-flex flex-wrap gap-2 w-100 justify-content-between">
                    <div>
                        <h6 class="mb-0">${email.sender}</h6>
                        <p class="mb-0 opacity-75">${email.subject}</p>
                    </div>
                    <small class="opacity-50 text-nowrap">${email.timestamp}</small>
                </div>
            </a>
        </div>
        `);

        document.querySelector("#emails-view").appendChild(divEmails);

        // te selecciona todos los nodos con esta clase y hace una lista
        const divs = document.querySelectorAll(".w-auto");

        // iteras esos nodos con la función forEach
        divs.forEach((div) => {
          let animation = gsap.fromTo(
            div,
            { scale: 1, ease: "none", duration: 0.5},
            { scale: 1.1, ease: "none", duration: 0.5 }
          );
          animation.pause();
          div.addEventListener("mouseenter", function () {
            animation.play();
          });
          div.addEventListener("mouseleave", function () {
            animation.reverse();
          });
        });

        // This function is trigger when the user click on an email
        divEmails.addEventListener("click", function () {
          history.pushState({ section: email.id }, "", `mail${email.id}`);
          seeEmail(email.id);
        });
      });
    });
}

async function seeEmail(id) {
  try {
    const response = await fetch(`/emails/${id}`);
    const email = await response.json();
    document.querySelector("#emails-view").style.display = "none";
    document.querySelector("#compose-view").style.display = "none";
    document.querySelector("#see-email").style.display = "block";

    const divSeeEmail = elementFromHtml(`
      <div class="row ">
        <div class="col">
          <div class="card card-cover h-100 overflow-hidden rounded-4 shadow-lg">
            <div class="d-flex flex-column h-100 p-4 pb-3  text-shadow-1">
                <div class="d-flex justify-content-end">
                    <small>${email.timestamp}</small>
                </div>
                <h3>${email.subject}</h3>
                <h6>From ${email.sender} to ${email.recipients[0]} </h6>
                <P>${email.body}</P>
                <div id="divButton"class="d-grid gap-2 d-md-flex justify-content-md-end mt-2">
                  <button type="button" id="archiveButton" class="btn btn-outline-dark"></button>
                  <button type="button" id="replyButton" class="btn btn-outline-success">Reply</button>
                </div>
            </div>
        </div>
        </div>`);

    // aca haces estos if statement porque sino te va a a ir creando elementos cada vez que haces click, aca entra al if si es que dentro de see-email hay otro nodo con clase row
    if (document.querySelector("#see-email").querySelector(".row")) {
      document.querySelector(".row").remove();
      document.querySelector("#see-email").appendChild(divSeeEmail);
    } else {
      document.querySelector("#see-email").appendChild(divSeeEmail);
    }

    read_email(id);
    document.getElementById("archiveButton").innerHTML = email.archived
      ? "Unarchive"
      : "Archive";
    document
      .getElementById("archiveButton")
      .addEventListener("click", function () {
        fetch(`/emails/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: !email.archived,
          }),
        });
        history.pushState({ section: "inbox" }, "", `inbox`);
        load_mailbox("inbox", (operation = !email.archived));
      });
    document
      .getElementById("replyButton")
      .addEventListener("click", function () {
        recipients = email.sender;
        if (email.subject.split(" ", 1) != "Re:") {
          email.subject = `Re: ${email.subject}`;
          // The split() method is used to split the email subject into an array of strings using the space character as the separator. The 1 argument passed to the split() method specifies the maximum number of splits to be made, which is 1 in this case. This means that the subject will be split into an array with one element, which is the string before the first space character. The code then checks if the first element of the resulting array (which is the string before the first space) is not equal to "Re:". If this condition is true, it means that the subject does not already start with "Re:".
        }
        subject = email.subject;

        body = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
        history.pushState({ section: "compose" }, "", `compose`);
        compose_email(recipients, subject, body, (respuesta = true));
      });
  } catch {
    console.log("error");
  }
}

// this function its called to change the read state of an email
function read_email(id) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}


// its called to send an email
function send_email(event) {
  event.preventDefault();
  //  todo, the parameter "event" is an event object that is passed into the function when it is called. As long as you update all references to the parameter within the function, you can name it whatever you like. Por ejemplo mi_evento pones en el parametro y despues mi_evento.preventDefault(). Pones esto de preventDefault para que el formulario no haga su comportamiento por defecto que seria mandarle los datos al backend, sino que primero haga todo lo que le pones aca.


  //   atrapas los valores de los formularios
  let recipients = document.querySelector("#compose-recipients").value;
  let subject = document.querySelector("#compose-subject").value;
  let body = document.querySelector("#compose-body").value;
  // envias esos valores al backend
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {

      const alertPlaceholder = document.getElementById("liveAlertPlaceholder");

      const alert = (message, type) => {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = [
          `<div class="alert alert-${type} alert-dismissible" role="alert">`,
          `   <div>${message}</div>`,
          '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
          "</div>",
        ].join("");

        alertPlaceholder.append(wrapper);
      };

      if (result.error) {
        alert("You must specify a recipient!", "danger");
      } else {
        history.pushState({ section: "sent" }, "", `sent`);
        load_mailbox("sent", (operation = "sent"));
      }
    })
    .catch((error) => {
      console.log(error);
    });
}
