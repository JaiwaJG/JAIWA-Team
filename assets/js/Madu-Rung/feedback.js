"use strict";

Guard.requireAuth();

const Feedback = {};

Feedback.load = async function(){

    const response =
        await API.get("/madu/feedback");

    Feedback.render(response.data || []);

};

Feedback.render = function(items){

    const list =
        document.getElementById("feedbackList");

    list.innerHTML="";

    items.forEach(item=>{

        list.innerHTML+=`

        <article>

            <h3>${item.name}</h3>

            <p>${item.email}</p>

            <p>${item.message}</p>

        </article>

        `;

    });

};

document.addEventListener(

"DOMContentLoaded",

()=>{

Feedback.load();

});