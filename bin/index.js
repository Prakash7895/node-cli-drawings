const inquirer = require("inquirer");
const chalk = require("chalk");

const Colors = [
  "Red",
  "Green",
  "Yellow",
  "Blue",
  "Magenta",
  "Cyan",
  "White",
  "Gray",
];

var matrix;
const helpMessage =
  ` \n\n Command Help\n  C w h\t\t=> Create Canvas of width w and height h.\n` +
  `  L x1 y1 x2 y2 => Draw a line from (x1,y1) to (x2,y2) in the canvas.\n` +
  `  R x1 y1 x2 y2 => Draw a rectangle with (x1,y1) and (x2,y2) as diagonal coordinates\n` +
  `  F x y c\t=> Fill selected color 'c' from point (x,y) in canvas.\n` +
  `  Q,q\t\t=> Quit\n \n`;

const showCanvas = () => {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      process.stdout.write(
        matrix[i][j].startsWith("bg") ? chalk[matrix[i][j]](" ") : matrix[i][j]
      );
    }
    console.log();
  }
};

const createCanvas = (w, h) => {
  matrix = [];
  for (let i = 0; i < h; i++) {
    const tmp = [];
    for (let j = 0; j < w; j++) {
      if (i === 0 || i === h - 1) {
        tmp.push("-");
      } else if (j === 0 || j === w - 1) {
        tmp.push("|");
      } else tmp.push(" ");
    }
    matrix.push(tmp);
  }
};

const showError = (msg) => {
  console.log(" \n " + chalk.redBright(msg));
};

const drawLine = (x1, y1, x2, y2) => {
  if (x1 === x2) {
    if (x1 < matrix[0].length) {
      for (
        let i = Math.min(y1, y2);
        i <= Math.min(Math.max(y1, y2), matrix.length - 1);
        i++
      ) {
        matrix[i][x1] = "x";
      }
    }
  } else if (y1 === y2) {
    if (y1 < matrix.length) {
      for (
        let i = Math.min(x1, x2);
        i <= Math.min(Math.max(x1, x2), matrix[0].length - 1);
        i++
      ) {
        matrix[y1][i] = "x";
      }
    }
  } else {
    const slope = (y2 - y1) / (x2 - x1);
    const yIntercept = y1 - slope * x1;

    for (
      let i = Math.min(x1, x2);
      i <= Math.min(Math.max(x1, x2), matrix[0].length - 1);
      i++
    ) {
      let y = slope * i + yIntercept;
      const errorMargin = 0.1;
      if (i < Math.max(x1, x2)) {
        const a = Math.abs(Math.round(y) - y);
        const yNext = slope * (i + 1) + yIntercept;
        const b = Math.abs(Math.round(yNext) - yNext);
        if (a <= errorMargin && a < b) {
          y = Math.round(y);
        }
      }
      if (y >= 0 && y < matrix.length && Number.isInteger(y)) {
        matrix[y][i] = "x";
      }
    }
  }
};

const drawRect = (x1, y1, x2, y2) => {
  drawLine(x1, y1, x2, y1);
  drawLine(x2, y1, x2, y2);
  drawLine(x2, y2, x1, y2);
  drawLine(x1, y2, x1, y1);
};

const fillColor = (x, y, c) => {
  if (
    matrix[y][x] !== "x" &&
    matrix[y][x] !== "-" &&
    matrix[y][x] !== "|" &&
    matrix[y][x] !== c
  ) {
    matrix[y][x] = c;
    if (x + 1 < matrix[0].length) fillColor(x + 1, y, c);
    if (x > 0) fillColor(x - 1, y, c);
    if (y + 1 < matrix.length) fillColor(x, y + 1, c);
    if (y > 0) fillColor(x, y - 1, c);
  }
};

const checkInputValidity = (st, regEx) => {
  return regEx.test(st);
};

const checkAnswer = (c) => {
  const q = c[0].toLowerCase();
  let regularExp, valid;

  let callAgain = true;

  switch (q) {
    case "c":
      regularExp = /^[cC] \d+ \d+$/;
      valid = checkInputValidity(c, regularExp);
      if (valid) {
        const arr = c.split(" ");
        createCanvas(+arr[1], +arr[2]);
        showCanvas();
      } else {
        showError("Enter valid input.");
      }
      break;

    case "l":
      if (matrix) {
        regularExp = /^[lL] \d+ \d+ \d+ \d+$/;
        valid = checkInputValidity(c, regularExp);
        if (valid) {
          const arr = c.split(" ");
          drawLine(+arr[1], +arr[2], +arr[3], +arr[4]);
          showCanvas();
        } else {
          showError("Enter valid input.");
        }
      } else {
        showError("Create a canvas first!");
      }
      break;

    case "r":
      if (matrix) {
        regularExp = /^[rR] \d+ \d+ \d+ \d+$/;
        valid = checkInputValidity(c, regularExp);
        if (valid) {
          const arr = c.split(" ");
          drawRect(+arr[1], +arr[2], +arr[3], +arr[4]);
          showCanvas();
        } else {
          showError("Enter valid input.");
        }
      } else {
        showError("Create a canvas first!");
      }
      break;

    case "f":
      if (matrix) {
        regularExp = /^[fF] \d+ \d+$/;
        valid = checkInputValidity(c, regularExp);
        if (valid) {
          const arr = c.split(" ");
          callAgain = false;
          inquirer
            .prompt({
              type: "list",
              name: "color",
              message: "Select a color to fill",
              choices: Colors,
            })
            .then((res) => {
              fillColor(+arr[1], +arr[2], "bg" + res.color);
              showCanvas();
              start();
            });
        } else {
          showError("Enter valid input.");
        }
      } else {
        showError("Create a canvas first!");
      }
      break;

    default:
      showError("Enter valid input.");
  }

  if (callAgain) {
    start();
  }
};

const start = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "canvas",
        message: "Enter command:",
        prefix: helpMessage,
      },
    ])
    .then((answers) => {
      answers = answers.canvas.trim();
      if (answers.length > 0) {
        if (answers[0].toLowerCase() === "q") {
          process.exit();
        }
        checkAnswer(answers);
      } else {
        showError("Enter valid input.");
        start();
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

start();
