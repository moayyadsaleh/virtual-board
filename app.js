document.addEventListener("DOMContentLoaded", function () {
  const board = document.getElementById("board");
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  const clearButton = document.getElementById("clearButton");
  const colorPicker = document.getElementById("colorPicker");
  const eraserButton = document.getElementById("eraserButton");
  const penButton = document.getElementById("penButton");
  const saveButton = document.getElementById("saveButton");
  const fileInput = document.getElementById("fileInput");
  const undoButton = document.getElementById("undoButton");
  const penSizeRange = document.getElementById("penSizeRange");
  const backgroundColorPicker = document.getElementById(
    "backgroundColorPicker"
  );

  canvas.width = board.offsetWidth;
  canvas.height = board.offsetHeight;
  canvas.style.border = "1px solid black";

  let isDrawing = false;
  let isErasing = false;
  let lastX = 0;
  let lastY = 0;
  let history = [];

  function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const color = isErasing ? "#ffffff" : colorPicker.value;
    context.strokeStyle = color;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.lineWidth = isErasing ? 20 : penSizeRange.value;
    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(offsetX, offsetY);
    context.stroke();
    lastX = offsetX;
    lastY = offsetY;
  }

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvas.addEventListener("touchstart", (e) => {
    isDrawing = true;
    const touch = e.touches[0];
    [lastX, lastY] = [
      touch.pageX - canvas.offsetLeft,
      touch.pageY - canvas.offsetTop,
    ];
  });

  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    draw(e.touches[0]);
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    saveState();
  });
  canvas.addEventListener("touchend", () => {
    isDrawing = false;
    saveState();
  });

  canvas.addEventListener("mouseout", () => {
    isDrawing = false;
    saveState();
  });

  clearButton.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  });

  eraserButton.addEventListener("click", () => {
    isErasing = true;
    eraserButton.classList.add("active");
    penButton.classList.remove("active");
  });

  penButton.addEventListener("click", () => {
    isErasing = false;
    penButton.classList.add("active");
    eraserButton.classList.remove("active");
  });

  saveButton.addEventListener("click", () => {
    const savedBackgroundColor = canvas.style.backgroundColor;

    canvas.style.backgroundColor = backgroundColorPicker.value;

    const imageData = canvas.toDataURL();

    canvas.style.backgroundColor = savedBackgroundColor;

    const link = document.createElement("a");
    link.download = "virtual_board.png";
    link.href = imageData;
    link.click();
  });

  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveState();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  undoButton.addEventListener("click", undo);

  function saveState() {
    history.push(canvas.toDataURL());
  }

  function undo() {
    if (history.length > 1) {
      history.pop();
      const restoredImage = new Image();
      restoredImage.src = history[history.length - 1];
      restoredImage.onload = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(restoredImage, 0, 0, canvas.width, canvas.height);
      };
    } else if (history.length === 1) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      history.pop();
    }
  }

  penSizeRange.addEventListener("input", () => {
    updatePenSize(penSizeRange.value);
  });

  function updatePenSize(size) {
    context.lineWidth = size;
  }

  backgroundColorPicker.addEventListener("input", () => {
    canvas.style.backgroundColor = backgroundColorPicker.value;
  });
});
