import p5 from 'p5';

export const MySketch = () => (p: p5) => {

    const axiom = "F";
    let sentence = axiom;
    const rules = [
        { match: "F", replace: "FF+[+F-F-F]-[-F+F+F]" },
        { match: "F", replace: "F[+F]F[-F][F]" },
        { match: "F", replace: "FF[-F+F]+[+F-F]" }
    ];
    let length = 100;
    const maxAngle = 30;
    const reductionRatio = 0.6;
    let thickness = 10;

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.angleMode(p.DEGREES);
    }

    function drawTree() {
        p.translate(p.width / 2, p.height);
        p.stroke(255);
        p.strokeWeight(thickness);
        for (let char of sentence) {
            if (char == "F") {
                let randomThickness = Math.max(1, thickness * Math.random() * 0.7); // Réduit l'épaisseur
                p.strokeWeight(randomThickness);
                p.line(0, 0, 0, -length);
                p.translate(0, -length);
            } else if (char == "+") {
                p.rotate(maxAngle);
            } else if (char == "-") {
                p.rotate(-maxAngle);
            } else if (char == "[") {
                thickness *= 0.7; // Réduit l'épaisseur pour les branches secondaires
                p.push();
            } else if (char == "]") {
                thickness /= 0.7; // Restaure l'épaisseur
                p.pop();
            }
        }
    }

    p.draw = () => {
        p.background(0);
        drawTree();
    }

    p.mousePressed = () => {
        length *= reductionRatio; // Réduit la taille à chaque itération
        let nextSentence = "";
        for (const char of sentence) {
            let found = false;
            for (const rule of rules) {
                if (char == rule.match) {
                    found = true;
                    nextSentence += p.random([rule.replace]); // Choisit une règle aléatoirement
                    break;
                }
            }
            if (!found) nextSentence += char;
        }
        sentence = nextSentence;
    }
};
