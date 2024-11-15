const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const senderNameInput = document.getElementById('senderName');
const progressCircle = document.getElementById('progressCircle');
const progressText = document.getElementById('progressText');

const CLIENT_ID = "874922187178-fptorkdo5dgnppoad0lf2dmr1q5hbvrd.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN = "1//04XX6kzypod13CgYIARAAGAQSNwF-L9Irh7OAsMq9Q0v2QGuRsGbt1HMVJ_wY37uhXbmENfuOkbZp5eGrS_JRdD6v8B_OOmbu8as";

async function getAccessToken() {
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: "refresh_token"
        })
    });
    const data = await response.json();
    return data.access_token;
}

function resetProgress() {
    progressCircle.style.setProperty('--progress', `0deg`);
    progressText.textContent = `0%`;
}

function updateProgress(progress) {
    const degree = (progress / 100) * 360;
    progressCircle.style.setProperty('--progress', `${degree}deg`);
    progressText.textContent = `${progress}%`;
}

async function uploadFile() {
    const senderName = senderNameInput.value.trim();
    if (!senderName) {
        alert("Please enter your name!");
        return;
    }

    const files = fileInput.files;
    if (files.length === 0) {
        alert("Please select a file!");
        return;
    }

    const accessToken = await getAccessToken();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const metadata = {
            name: `${senderName}_${file.name}`,
            parents: ["root"]
        };

        const formData = new FormData();
        formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
        formData.append("file", file);

        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = function(event) {
            const progress = Math.round((event.loaded / event.total) * 100);
            updateProgress(progress);
        };

        xhr.onload = function() {
            if (xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                alert(`File ${result.name} uploaded successfully by ${senderName}!`);
                displayFiles([{ name: result.name, size: file.size }]);
            } else {
                alert(`Failed to upload file: ${xhr.statusText}`);
            }
            resetProgress();
        };

        xhr.onerror = function() {
            alert("Error uploading the file.");
            resetProgress();
        };

        xhr.open("POST", "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", true);
        xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
        xhr.send(formData);
    }

    fileInput.value = "";
}

function displayFiles(files) {
    files.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-item';
        fileDiv.innerHTML = `
            <span><i class="fas fa-file-alt"></i> ${file.name}</span>
            <span>${(file.size / 1024).toFixed(2)} KB</span>
        `;
        fileList.appendChild(fileDiv);
    });
}

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
    }
});
