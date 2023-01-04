const searchInput = document.querySelector("#search-image-input");
const submitBtn = document.querySelector(".submitBtn");
const cardContainer = document.querySelector(".wrapper__main__card");
const sortBtnList = document.querySelectorAll("input[name=radio-btn]");
const sizeOptionList = document.querySelector("#size-options");
const numberImageInput = document.querySelector("#number-image");
const messContainer = document.querySelector(".wrapper__header");
const downloadBtn = document.querySelector(".card__download-btn");
const cardImg = document.querySelector(".card__img");
const apiKey = "1094eedda70a4792a96d7bf8e0bd0658";

let textValue,
    sizeValue = "";
let numberImageList = 5;
let sortValue = "relevance";


function submitHandler() {
    if (!textValue || !sizeValue) {
        showMessage("Warning!", "Please fill out all fields");
        return;
    }
    displayLoading();

    // Get the data from Flickr database 
    fetch(
        `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&text=${textValue}&safe_search=1&sort=${sortValue}&extras=url_${sizeValue}&per_page=${numberImageList}&format=json&nojsoncallback=1`
    )
        .then((res) => res.json())
        .then((data) => {
            // Refresh the container 
            cardContainer.innerHTML = "";
            if (data.photos.pages === 0) {
                showMessage("Warning!", 'Not found');
            }

            // Loop over the array of photos and then display it
            const imageList = data.photos.photo;
            imageList.map((item, i) => {
                let element = `
                    <div class="card__box">
                        <img
                            src="https://live.staticflickr.com/${item.server}/${item.id}_${item.secret}_${sizeValue}.jpg"   
                            loading="lazy" 
                            alt=${item.title}
                            class="card__img"
                        />  
                        <div class="card__download-btn hide">
                            <i class="fa-solid fa-download"></i>
                        </div>
                    </div>`;
                cardContainer.innerHTML += element;
            });

            // Loop through the download buttons and download the image if the button is clicked. 
            let btnList = document.querySelectorAll('.card__download-btn');
            for (let i = 0; i < btnList.length; i++) {
                btnList[i].classList.add('showBtn');
                btnList[i].addEventListener('click', () => {
                    imageList.map((item, idx) => {
                        if (idx === i) {
                            downloadImage(`https://live.staticflickr.com/${item.server}/${item.id}_${item.secret}_${sizeValue}.jpg`, `${item.id}.jpg`)
                        }
                    })
                });
            }

            hideLoading();
        })
        .catch((err) => {
            throw new Error(err);
        });
}

// Animation for loading  
function displayLoading() {
    anime({
        targets: ".progress-bar__line",
        width: ["0%", "20%"],
        easing: "easeInOutQuad",
        opacity: 1,
    });
}

function hideLoading() {
    anime({
        targets: ".progress-bar__line",
        width: ["20%", "100%"],
        easing: "easeInOutQuad",
        opacity: 1,
        complete: function () {
            anime({
                targets: ".progress-bar__line",
                opacity: 0,
                width: 0,
            });
        },
    });
}

function showMessage(typeErr, mess) {
    let popup = `
    <div class="popup w-72">
        <div
            class="w-30 bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mx-auto rounded-md absolute p-auto"
            role="alert"
        >
            <p class="font-bold">${typeErr}</p>
            <p>${mess}</p>
        </div>
    </div>`;

    messContainer.insertAdjacentHTML("afterbegin", popup);

    setTimeout(() => {
        document.querySelector(".popup").remove();
    }, 1800);
}

// Check if the number input is bigger than 500 
function checkMaxNumber(value) {
    if (value > 500) {
        numberImageInput.value = 500;
        validate("Warning!", "Max 500 images");
    }
}

// Download image function
async function downloadImage(imageSrc, title) {
    const image = await fetch(imageSrc);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement("a");
    link.href = imageURL;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

numberImageInput.addEventListener("change", (e) => {
    numberImageList = e.target.value;
});

searchInput.addEventListener("keyup", (e) => {
    if (e.keyCode === 13 && textValue) {
        submitHandler();
    }
    textValue = searchInput.value;
});

sizeOptionList.addEventListener("change", (e) => {
    sizeValue = e.target.value;
    if (e.target.value > 500) sizeValue === 500;
});


// Sort the images for the search and changes its value every time user make a action
sortBtnList.forEach((btn) => {
    btn.parentElement.addEventListener("click", (e) => {
        document
            .querySelector(".search-sort__item.active")
            .classList.remove("active");

        let id = e.currentTarget.firstElementChild.id;
        if (id === "interesting-btn") {
            sortValue = "interestingness";
        }
        if (id === "date-uploaded-btn") {
            sortValue = "date-posted-asc";
        }
        if (id === "relevant-btn") {
            sortValue = "relevance";
        }
        btn.parentElement.classList.add("active");
    });
});

submitBtn.addEventListener("click", () => {
    submitHandler();
});
