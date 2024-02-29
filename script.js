const dropZone = document.querySelector('.drop-zone');
const browseBtn = document.querySelector('.browseBtn');
const fileInput = document.querySelector('#fileInput');

const progressContainer = document.querySelector('.progress-container');
const bgProgress = document.querySelector('.bg-progress');
const progressBar = document.querySelector('.progress-bar');
const parcentBar = document.querySelector('#parcent');

const sharingContainer = document.querySelector('.sharing-container');
const fileUrlInput = document.querySelector('#fileUrl');
const copyBtn = document.querySelector('#copyBtn');

const emailForm = document.querySelector('#emailForm');
const toast = document.querySelector('.toast');

const host = 'https://vocal-sign-production.up.railway.app/';
const uploadUrl = `${host}api/files`;
const emailUrlUrl = `${host}api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024;

dropZone.addEventListener("dragover", (e)=>{
    e.preventDefault();

    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged");
    }
});

dropZone.addEventListener("dragleave", ()=>{
    dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    if(files.length){
        fileInput.files = files;
        uploadFile();
    }
});

fileInput.addEventListener("change", ()=>{
    uploadFile();
})

browseBtn.addEventListener("click", ()=>{
    fileInput.click();
});

copyBtn.addEventListener("click", ()=>{
    fileUrlInput.select();
    navigator.clipboard.writeText(fileUrlInput.value);
    showToast("Link copied in clipboard");
});

const uploadFile = ()=>{
    if(fileInput.files.length > 1){
        resetInputField();
        showToast("Please select only one file!")
        return;
    }
    const file = fileInput.files[0];
    if(file.size > maxAllowedSize){
        showToast("File size exceeds 100MB. Please select a smaller file!")
        resetInputField();
        return;
    }

    progressContainer.computedStyleMap.display = "block";

    const formData = new FormData();
    formData.append("myFile", file);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () =>{
        if(xhr.readyState === XMLHttpRequest.DONE){
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response));
        }
    }

    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror = () => {
        resetInputField();
        showToast(`Erroe in upload: ${xhr.statusText}`)
    }

    xhr.open("POST", uploadUrl);
    xhr.send(formData);
}

const updateProgress = (e) => {
    const parcent = Math.round((e.loaded / e.total) * 100);
    bgProgress.style.width = `${parcent}%`;
    parcentBar.innerText = parcent;
    progressBar.style.transform = `scaleX(${parcent / 100})`;
}

const onUploadSuccess = ({file: url}) => {
    resetInputField();
    emailForm[2].removeAttribute("disable");
    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";
    fileUrlInput.value = url;
};

const resetInputField = () => {
    fileInput.value = "";
}

emailForm.addEventListener("submit", (e)=>{
    e.preventDefault();

    const url = fileUrlInput.value;
    const formData = {
        uuid: url.split('/').splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    };

    emailForm[2].setAttribute("disable", "true");

    fetch(emailUrlUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
        .then(res => res.json())
        .then(({success}) => {
            if(success){
                sharingContainer.style.display = "none";
                showToast("Email Send!")
            }
        });
});

let toastTimer;
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = "translate(-50%, 0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() =>{
        toast.style.transform = "translate(-50%, 80px)";
    },2000)
};