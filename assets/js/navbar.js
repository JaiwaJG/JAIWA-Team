/* ==========================================================
   JAIWA Team
   File : assets/js/navbar.js
   Purpose : Navigation
   Version : 1.0
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initNavbar();

});


/* ==========================================
   Navbar
========================================== */

function initNavbar(){

    const header = document.querySelector(".header");

    const menu = document.querySelector(".nav-menu");

    const toggle = document.querySelector(".menu-toggle");

    const links = document.querySelectorAll(".nav-link");


    /* ==========================
       Sticky Header
    ========================== */

    window.addEventListener("scroll", () => {

        if(window.scrollY > 20){

            header.classList.add("scrolled");

        }else{

            header.classList.remove("scrolled");

        }

    });


    /* ==========================
       Mobile Toggle
    ========================== */

    if(toggle){

        toggle.addEventListener("click",()=>{

            menu.classList.toggle("active");

            toggle.classList.toggle("active");

        });

    }


    /* ==========================
       Close Menu
    ========================== */

    links.forEach(link=>{

        link.addEventListener("click",()=>{

            menu.classList.remove("active");

            toggle.classList.remove("active");

        });

    });


    /* ==========================
       Window Resize
    ========================== */

    window.addEventListener("resize",()=>{

        if(window.innerWidth > 992){

            menu.classList.remove("active");

            toggle.classList.remove("active");

        }

    });


    /* ==========================
       Active Link
    ========================== */

    links.forEach(link=>{

        link.addEventListener("click",()=>{

            links.forEach(item=>{

                item.classList.remove("active");

            });

            link.classList.add("active");

        });

    });

}