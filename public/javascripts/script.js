async function updatePost(event, id) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const updatedTags = formData.get("tags").split(",").map(tag => tag.trim());

    const data = {
        title: formData.get("title"),
        from: formData.get("from"),
        to: formData.get("to"),
        description: formData.get("description"),
        tags: updatedTags,
    };

    try {
        const response = await fetch(`/posts/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        });

        if (response.ok) {
        localStorage.setItem("skipWelcomeScreen", "true"); 
        window.location.reload();
        } else {
        alert("Failed to update post.");
        }
    } catch (error) {
        console.error("Error updating post:", error);
    }
}

async function deletePost(id) {
    try {
        const response = await fetch(`/delete/${id}`, {
        method: "DELETE",
        });
        localStorage.setItem("skipWelcomeScreen", "true"); 
        window.location.reload();
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred");
    }
}
  
document.addEventListener("DOMContentLoaded", () => {
const postButton = document.getElementById("postButton");
const newPostForm = document.getElementById("new-post-form");
const overlay = document.getElementById("overlay");
const closeFormButton = document.getElementById("closeFormButton");
const tagButtons = document.querySelectorAll(".tag-button");

// Tag button random tilt
tagButtons.forEach(tagButton => {
    const randomRotation = Math.random() * 30 - 15;
    const randomX = Math.random() * 10;
    tagButton.style.transform = `rotate(${randomRotation}deg) translateX(${randomX}px)`;

    tagButton.addEventListener("click", () => {
    const newRotation = Math.random() * 30 - 15;
    const newX = Math.random() * 10;
    tagButton.style.transform = `rotate(${newRotation}deg) translateX(${newX}px)`;
    });
});

// Show/hide post form
postButton.addEventListener("click", () => {
    newPostForm.style.display = "block";
    overlay.style.display = "block";
});

overlay.addEventListener("click", () => {
    newPostForm.style.display = "none";
    overlay.style.display = "none";
});

closeFormButton.addEventListener("click", () => {
    newPostForm.style.display = "none";
    overlay.style.display = "none";
});

// Edit button interactions
document.querySelectorAll(".editButton").forEach(button => {
    button.addEventListener("click", event => {
    const postElement = event.target.closest(".post");
    const editForm = postElement.querySelector("form");
    if (editForm.style.display === "block") {
        editForm.style.display = "none";
        postElement.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
        postElement.classList.remove("opened");
    } else {
        editForm.style.display = "block";
        postElement.style.transform = "rotate(0deg) scale(1.5)";
        postElement.classList.add("opened");
    }
    });
});

// Drag and drop posts
const posts = document.querySelectorAll(".post");

posts.forEach(post => {
    const randomX = Math.floor(Math.random() * 50);
    const randomY = Math.floor(Math.random() * 50);
    const randomRotation = Math.random() * 30 - 15;

    post.style.position = "absolute";
    post.style.top = `${randomY}vh`;
    post.style.left = `${randomX}vw`;
    post.style.transform = `rotate(${randomRotation}deg)`;

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const startDrag = (x, y) => {
    isDragging = true;
    offsetX = x - post.getBoundingClientRect().left;
    offsetY = y - post.getBoundingClientRect().top;
    post.style.transition = "none";
    };

    const performDrag = (x, y) => {
    if (isDragging) {
        const container = document.getElementById("posts-container").getBoundingClientRect();

        const newLeft = Math.min(
        Math.max(x - offsetX - container.left, 0),
        container.width - post.offsetWidth
        );
        const newTop = Math.min(
        Math.max(y - offsetY - container.top, 0),
        container.height - post.offsetHeight
        );

        post.style.left = `${newLeft}px`;
        post.style.top = `${newTop}px`;
    }
    };

    // Mouse events
    post.addEventListener("mousedown", e => startDrag(e.clientX, e.clientY));
    document.addEventListener("mousemove", e => performDrag(e.clientX, e.clientY));
    document.addEventListener("mouseup", () => {
    if (isDragging) {
        isDragging = false;
        post.style.transition = "top 0.3s ease, left 0.3s ease";
    }
    });

    // Touch events
    post.addEventListener("touchstart", e => startDrag(e.touches[0].clientX, e.touches[0].clientY));
    document.addEventListener("touchmove", e => performDrag(e.touches[0].clientX, e.touches[0].clientY));
    document.addEventListener("touchend", () => {
    if (isDragging) {
        isDragging = false;
        post.style.transition = "top 0.3s ease, left 0.3s ease";
    }
    });
});
});

document.addEventListener("DOMContentLoaded", () => {
const welcomeScreen = document.getElementById("welcomeScreen");
const contentWrapper = document.getElementById("contentWrapper");
const backToWelcomeButton = document.createElement("button");

backToWelcomeButton.textContent = "Back to Welcome Page";
backToWelcomeButton.className = "button-74";
backToWelcomeButton.style.position = "fixed";
backToWelcomeButton.style.bottom = "20px";
backToWelcomeButton.style.right = "20px";
contentWrapper.appendChild(backToWelcomeButton);

if (localStorage.getItem("skipWelcomeScreen") === "true") {
    welcomeScreen.style.display = "none";
    contentWrapper.style.visibility = "visible";
    contentWrapper.style.opacity = "1";
    localStorage.removeItem("skipWelcomeScreen"); 
} else {
    welcomeScreen.style.display = "flex";
    contentWrapper.style.visibility = "hidden";
    contentWrapper.style.opacity = "0";
}

welcomeScreen.addEventListener("click", () => {
    welcomeScreen.style.display = "none"; 
    contentWrapper.style.visibility = "visible";
    contentWrapper.style.opacity = "1"; 
    localStorage.setItem("welcomeDismissed", "true");
});

backToWelcomeButton.addEventListener("click", () => {
    welcomeScreen.style.display = "flex";
    contentWrapper.style.visibility = "hidden";
    contentWrapper.style.opacity = "0"; 
    localStorage.setItem("welcomeDismissed", "false");
});
});

const postForm = document.getElementById("new-post-form");
postForm.addEventListener("submit", () => {
localStorage.setItem("skipWelcomeScreen", "true");
});

// Toggle caret details
function toggleDetails(button) {
const post = button.closest(".post");
const details = post.querySelector(".post-details");
const downCaret = post.querySelector(".fa-caret-down");
const upCaret = post.querySelector(".fa-caret-up");

if (details.classList.contains("hidden")) {
    details.classList.remove("hidden");
    downCaret.style.display = "none";
    upCaret.style.display = "inline";
    post.style.transform = "rotate(0deg) scale(1.5)";
    post.classList.add("opened");
} 
else {
    details.classList.add("hidden");
    downCaret.style.display = "inline";
    upCaret.style.display = "none";
    const randomRotation = Math.random() * 30 - 15;
    post.style.transform = `rotate(${randomRotation}deg)`;
    post.classList.remove("opened");
}
}

// Toggles instruction button
document.getElementById("instructions-toggle").addEventListener("click", function () {
const instructionsBox = document.getElementById("instructions-box");
if (instructionsBox.classList.contains("hidden")) {
    instructionsBox.classList.remove("hidden");
    instructionsBox.style.display = "block";
} else {
    instructionsBox.classList.add("hidden");
    instructionsBox.style.display = "none";
}
});

// Filter function
function filterPosts(selectedTag) {
const allPosts = document.querySelectorAll('.post');
const tagButtons = document.querySelectorAll('.tag-button');

if (selectedTag === 'All') {
    allPosts.forEach(post => {
    post.style.display = 'block';
    });

    tagButtons.forEach(button => {
    button.classList.remove('active');
    });
    document.querySelector('.tag-button[data-tag="All"]').classList.add('active');
} else {
    allPosts.forEach(post => {
    const postTags = post.dataset.tags.split(',');
    if (postTags.includes(selectedTag)) {
        post.style.display = 'block';
    } else {
        post.style.display = 'none';
    }
    });

    tagButtons.forEach(button => {
    button.classList.remove('active');
    });
    document.querySelector(`.tag-button[data-tag="${selectedTag}"]`).classList.add('active');
}
}