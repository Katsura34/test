 
        const key2x2 = [[0,0], [0,0]];
        const key3x3 = [[0,0,0], [0,0,0], [0,0,0]];

        function buildMatrixInputs() {
            const size = document.querySelector('input[name="matrixSize"]:checked').value;
            const matrixInputs = document.getElementById("matrixInputs");
            matrixInputs.innerHTML = "";
            
            const defaultKey = size === "2" ? key2x2 : key3x3;
            const n = parseInt(size);
            
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const input = document.createElement("input");
                    input.type = "number";
                    input.value = defaultKey[i][j];
                    input.id = `key_${i}_${j}`;
                    input.min = "0";
                    input.max = "25";
                    input.style.width = "50px";
                    input.style.margin = "5px";
                    matrixInputs.appendChild(input);
                }
                matrixInputs.appendChild(document.createElement("br"));
            }
        }


        /**
         * Process the input text using the selected cipher and operation.
         */
        function processText(operation) {
            const cipher = document.querySelector('input[name="cipher"]:checked').value;
            const text = document.getElementById("textInput").value;
            let result = "";

            if (cipher === "caesar") {
                const shift = parseInt(document.getElementById('shiftInput').value);
                result = caesarProcess(text, shift, operation);
            } else {
                const key = getKeyMatrix();
                // const inverseKey = getMatrixInverse(key);
                result = hillProcess(text, key, operation);
            }

            document.getElementById("output").innerText = result;
        }


         function getKeyMatrix() {
            const size = document.querySelector('input[name="matrixSize"]:checked').value;
            const n = parseInt(size);
            const matrix = [];
            
            for (let i = 0; i < n; i++) {
                matrix[i] = [];
                for (let j = 0; j < n; j++) {
                    const val = parseInt(document.getElementById(`key_${i}_${j}`).value) || 0;
                    matrix[i][j] = val % 26;
                }
            }
            return matrix;
        }

       

        // Caesar Cipher
        function caesarProcess(text, shift, operation) {
            const s = Number(shift) || 0;
            const rawKey = operation === "encrypt" ? s : -s;
            const key = ((rawKey % 26) + 26) % 26;
            let result = "";

            for (let char of text) {
                if (char.match(/[a-z]/i)) {
                    const isLower = char === char.toLowerCase();
                    let base;
                    if (isLower) {
                        base = 97;
                    } else {
                        base = 65;
                    }
                    const charCode = char.charCodeAt(0) - base;
                    const shifted = (charCode + key) % 26;
                    result += String.fromCharCode(shifted + base);
                } else {
                    result += char;
                }
            }
            return `${operation === "encrypt" ? "Encrypted" : "Decrypted"}: ${result}`;
        }

        // Hill Cipher
        function hillProcess(text, key, operation) {
            if (operation === "encrypt") {
                return hillEncrypt(text, key);
            } else {
                return hillDecrypt(text, key);
            }
        }

        function matrixDeterminant(matrix) {
            const n = matrix.length;
            if (n === 2) {
                return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
            } else if (n === 3) {
                return matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1])
                     - matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0])
                     + matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
            }
        }

        function getMatrixInverse(key) {
            const n = key.length;
            const det = matrixDeterminant(key);
            const modDet = ((det % 26) + 26) % 26;
            
            let invDet = 0;
            for (let i = 1; i < 26; i++) {
                if ((modDet * i) % 26 === 1) {
                    invDet = i;
                    break;
                }
            }
            
            if (invDet === 0) {
                throw new Error("Matrix is not invertible!: "+ invDet);
            }

            if (n === 2) {
                const adjugate = [
                    [key[1][1], -key[0][1]],
                    [-key[1][0], key[0][0]]
                ];
                
                const inverse = [];
                for (let i = 0; i < 2; i++) {
                    inverse[i] = [];
                    for (let j = 0; j < 2; j++) {
                        inverse[i][j] = ((adjugate[i][j] * invDet) % 26 + 26) % 26;
                    }
                }
                return inverse;
            } else if (n === 3) {
                const adj = [
                    [
                        (key[1][1] * key[2][2] - key[1][2] * key[2][1]),
                        (key[0][2] * key[2][1] - key[0][1] * key[2][2]),
                        (key[0][1] * key[1][2] - key[0][2] * key[1][1])
                    ],
                    [
                        (key[1][2] * key[2][0] - key[1][0] * key[2][2]),
                        (key[0][0] * key[2][2] - key[0][2] * key[2][0]),
                        (key[0][2] * key[1][0] - key[0][0] * key[1][2])
                    ],
                    [
                        (key[1][0] * key[2][1] - key[1][1] * key[2][0]),
                        (key[0][1] * key[2][0] - key[0][0] * key[2][1]),
                        (key[0][0] * key[1][1] - key[0][1] * key[1][0])
                    ]
                ];
                
                const inverse = [];
                for (let i = 0; i < 3; i++) {
                    inverse[i] = [];
                    for (let j = 0; j < 3; j++) {
                        inverse[i][j] = ((adj[i][j] * invDet) % 26 + 26) % 26;
                    }
                }
                return inverse;
            }
        }

        function hillEncrypt(text, key) {
            const n = key.length;
            let plaintext = text.toUpperCase();

            if (plaintext.length % n !== 0) {
                plaintext += "X".repeat(n - (plaintext.length % n));
            }

            let result = "";
            let result1 = "";

            for (let i = 0; i < plaintext.length; i += n) {
                const block = [];
                for (let j = 0; j < n; j++) {
                    block[j] = plaintext.charCodeAt(i + j) - 65;
                }

                const encrypted = [];
                for (let j = 0; j < n; j++) {
                    let sum = 0;
                    for (let k = 0; k < n; k++) {
                        sum += key[j][k] * block[k];
                    }
                    encrypted[j] = ((sum % 26) + 26) % 26;
                }

                for (let j = 0; j < n; j++) {
                    result += String.fromCharCode(encrypted[j] + 65);
                    result1 += encrypted[j] + 65 + " ";
                   
                }
            }
            console.log("Plaintext blocks (numeric):", result1);
            return `Encrypted: ${result}`;
        }

        function hillDecrypt(text, key) {
            try {
                const n = key.length;
                const inverseKey = getMatrixInverse(key);
                let ciphertext = text.toUpperCase();

                if (ciphertext.length % n !== 0) {
                    ciphertext += "X".repeat(n - (ciphertext.length % n));
                }

                let result = "";
                for (let i = 0; i < ciphertext.length; i += n) {
                    const block = [];
                    for (let j = 0; j < n; j++) {
                        block[j] = ciphertext.charCodeAt(i + j) - 65;
                    }

                    const decrypted = [];
                    for (let j = 0; j < n; j++) {
                        let sum = 0;
                        for (let k = 0; k < n; k++) {
                            sum += inverseKey[j][k] * block[k];
                        }
                        decrypted[j] = ((sum % 26) + 26) % 26;
                    }

                    for (let j = 0; j < n; j++) {
                        result += String.fromCharCode(decrypted[j] + 65);
                    }
                }

                return `Decrypted: ${result}`;
            } catch (e) {
                return `Error: ${e.message}`;
            }
        }



         /**
         * Show or hide the matrix inputs and shift input depending on selected cipher.
         * Hides the `shiftSection` when Hill cipher is selected.
         */
        function toggleMatrixSection() {
            const cipher = document.querySelector('input[name="cipher"]:checked').value;
            const matrixSection = document.getElementById("matrixSection");
            const shiftSection = document.getElementById("shiftSection");
            if (cipher === "hill") {
                matrixSection.style.display = "block";
                buildMatrixInputs();
                if (shiftSection) shiftSection.style.display = "none";
            } else {
                matrixSection.style.display = "none";
                if (shiftSection) shiftSection.style.display = "block";
            }
        }

        document.addEventListener("DOMContentLoaded", function() {
            document.querySelectorAll('input[name="cipher"]').forEach(radio => {
                radio.addEventListener("change", toggleMatrixSection);
            });
            document.querySelectorAll('input[name="matrixSize"]').forEach(radio => {
                radio.addEventListener("change", buildMatrixInputs);
            });
            // initialize visibility for matrix and shift inputs
            toggleMatrixSection();
        });
