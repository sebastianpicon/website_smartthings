class AdvancedCalculator {
    constructor() {
        this.currentExpression = '';
        this.currentResult = '0';
        this.history = [];
        this.calculatorMode = 'basic';
        
        this.init();
    }

    init() {
        this.setupModeSelector();
        this.loadHistory();
        this.updateDisplay();
    }

    setupModeSelector() {
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.switchMode(btn.dataset.mode);
            });
        });
    }

    switchMode(mode) {
        this.calculatorMode = mode;
        
        // Hide all interfaces
        document.getElementById('basicButtons').style.display = 'none';
        document.getElementById('scientificButtons').style.display = 'none';
        document.getElementById('calculusButtons').style.display = 'none';
        
        // Show selected interface
        switch (mode) {
            case 'basic':
                document.getElementById('basicButtons').style.display = 'block';
                break;
            case 'scientific':
                document.getElementById('scientificButtons').style.display = 'block';
                break;
            case 'calculus':
                document.getElementById('calculusButtons').style.display = 'block';
                break;
        }
    }

    appendNumber(num) {
        if (this.currentResult === '0' || this.currentResult === 'Error') {
            this.currentResult = num;
        } else {
            this.currentResult += num;
        }
        this.updateDisplay();
    }

    appendOperator(op) {
        if (this.currentResult !== 'Error') {
            this.currentExpression = this.currentResult + ' ' + op + ' ';
            this.currentResult = '0';
            this.updateDisplay();
        }
    }

    appendFunction(func, suffix = ')') {
        this.currentResult = func + this.currentResult + suffix;
        this.updateDisplay();
    }

    appendConstant(constant) {
        switch (constant) {
            case 'pi':
                this.currentResult = Math.PI.toString();
                break;
            case 'e':
                this.currentResult = Math.E.toString();
                break;
        }
        this.updateDisplay();
    }

    clearAll() {
        this.currentResult = '0';
        this.currentExpression = '';
        this.updateDisplay();
    }

    clearEntry() {
        this.currentResult = '0';
        this.updateDisplay();
    }

    backspace() {
        if (this.currentResult.length > 1) {
            this.currentResult = this.currentResult.slice(0, -1);
        } else {
            this.currentResult = '0';
        }
        this.updateDisplay();
    }

    calculate() {
        try {
            let expression = this.currentExpression + this.currentResult;
            
            // Replace display symbols with JavaScript operators
            expression = expression.replace(/×/g, '*')
                        .replace(/÷/g, '/')
                        .replace(/−/g, '-');
            
            // Handle scientific functions
            expression = this.processScientificFunctions(expression);
            
            // Evaluate the expression safely
            const result = this.safeEval(expression);
            
            if (isNaN(result) || !isFinite(result)) {
                this.currentResult = 'Error';
            } else {
                // Add to history
                this.addToHistory(this.currentExpression + this.currentResult.replace(/\*/g, '×').replace(/\//g, '÷'), result);
                
                // Format result
                this.currentResult = this.formatResult(result);
                this.currentExpression = '';
            }
        } catch (error) {
            this.currentResult = 'Error';
        }
        this.updateDisplay();
    }

    safeEval(expression) {
        // Create a safe evaluation function
        const allowedChars = /^[0-9+\-*/().\s,MathsincoetanlgqrpowE]+$/;
        if (!allowedChars.test(expression)) {
            throw new Error('Invalid expression');
        }
        
        return Function('"use strict"; return (' + expression + ')')();
    }

    formatResult(result) {
        // Format large and small numbers appropriately
        if (Math.abs(result) > 1e15 || (Math.abs(result) < 1e-6 && result !== 0)) {
            return result.toExponential(6);
        } else if (result % 1 === 0 && Math.abs(result) < 1e10) {
            return result.toString();
        } else {
            return parseFloat(result.toPrecision(12)).toString();
        }
    }

    processScientificFunctions(expression) {
        // Replace scientific functions with JavaScript Math equivalents
        return expression
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/pow\(/g, 'Math.pow(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(');
    }

    updateDisplay() {
        document.getElementById('displayMain').textContent = this.currentResult;
        document.getElementById('displayHistory').textContent = this.currentExpression;
    }

    // Calculus Functions
    calculateDerivative() {
        const func = document.getElementById('functionInput').value;
        const variable = document.getElementById('variableInput').value || 'x';
        const point = parseFloat(document.getElementById('pointInput').value) || 0;
        
        if (!func) {
            this.showCalculusResult('Please enter a function');
            return;
        }
        
        try {
            const result = this.numericalDerivative(func, variable, point);
            this.showCalculusResult(`Derivative of ${func}:\n\nd/d${variable}[${func}] ≈ ${result.toFixed(8)}\n\nAt ${variable} = ${point}`);
        } catch (error) {
            this.showCalculusResult('Error calculating derivative:\n' + error.message);
        }
    }

    calculateIntegral() {
        const func = document.getElementById('functionInput').value;
        const variable = document.getElementById('variableInput').value || 'x';
        const interval = document.getElementById('pointInput').value;
        
        if (!func) {
            this.showCalculusResult('Please enter a function');
            return;
        }
        
        try {
            let a = 0, b = 1;
            if (interval && interval.includes('[') && interval.includes(']')) {
                const bounds = interval.replace(/[\[\]]/g, '').split(',');
                a = parseFloat(bounds[0]) || 0;
                b = parseFloat(bounds[1]) || 1;
            }
            
            const result = this.numericalIntegral(func, variable, a, b);
            this.showCalculusResult(`Definite integral of ${func}:\n\n∫[${a} to ${b}] ${func} d${variable} ≈ ${result.toFixed(8)}\n\nUsing Simpson's rule with 1000 intervals`);
        } catch (error) {
            this.showCalculusResult('Error calculating integral:\n' + error.message);
        }
    }

    calculateLimit() {
        const func = document.getElementById('functionInput').value;
        const variable = document.getElementById('variableInput').value || 'x';
        const point = document.getElementById('pointInput').value;
        
        if (!func || !point) {
            this.showCalculusResult('Please enter a function and point');
            return;
        }
        
        try {
            const limitPoint = parseFloat(point);
            const result = this.calculateLimitValue(func, variable, limitPoint);
            this.showCalculusResult(`Limit of ${func}:\n\nlim(${variable}→${point}) ${func} ≈ ${result.toFixed(8)}\n\nUsing numerical approximation`);
        } catch (error) {
            this.showCalculusResult('Error calculating limit:\n' + error.message);
        }
    }

    evaluateFunction() {
        const func = document.getElementById('functionInput').value;
        const variable = document.getElementById('variableInput').value || 'x';
        const point = document.getElementById('pointInput').value;
        
        if (!func || !point) {
            this.showCalculusResult('Please enter a function and point');
            return;
        }
        
        try {
            const result = this.evaluateFunctionAt(func, variable, parseFloat(point));
            this.showCalculusResult(`Function evaluation:\n\nf(${point}) = ${result}\n\nwhere f(${variable}) = ${func}`);
        } catch (error) {
            this.showCalculusResult('Error evaluating function:\n' + error.message);
        }
    }

    // Numerical Methods
    numericalDerivative(func, variable, point, h = 1e-7) {
        const f = (x) => this.evaluateFunctionAt(func, variable, x);
        return (f(point + h) - f(point - h)) / (2 * h);
    }

    numericalIntegral(func, variable, a, b, n = 1000) {
        const f = (x) => this.evaluateFunctionAt(func, variable, x);
        const h = (b - a) / n;
        let sum = 0;
        
        // Simpson's rule
        for (let i = 0; i <= n; i++) {
            const x = a + i * h;
            const weight = (i === 0 || i === n) ? 1 : (i % 2 === 1) ? 4 : 2;
            sum += weight * f(x);
        }
        
        return (h / 3) * sum;
    }

    calculateLimitValue(func, variable, point, epsilon = 1e-10) {
        const f = (x) => this.evaluateFunctionAt(func, variable, x);
        
        // Check from both sides
        const leftApproach = [];
        const rightApproach = [];
        
        for (let i = 1; i <= 10; i++) {
            const h = Math.pow(10, -i);
            leftApproach.push(f(point - h));
            rightApproach.push(f(point + h));
        }
        
        // Return the average of the last few values if they're converging
        const leftLimit = leftApproach[leftApproach.length - 1];
        const rightLimit = rightApproach[rightApproach.length - 1];
        
        if (Math.abs(leftLimit - rightLimit) < epsilon) {
            return (leftLimit + rightLimit) / 2;
        } else {
            return rightLimit; // or throw error if limits don't match
        }
    }

    evaluateFunctionAt(func, variable, value) {
        // Replace the variable with the value
        let expression = func.replace(new RegExp(`\\b${variable}\\b`, 'g'), value.toString());
        
        // Replace mathematical notation with JavaScript equivalents
        expression = expression
            .replace(/\^/g, '**')
            .replace(/\bsin\b/g, 'Math.sin')
            .replace(/\bcos\b/g, 'Math.cos')
            .replace(/\btan\b/g, 'Math.tan')
            .replace(/\blog\b/g, 'Math.log10')
            .replace(/\bln\b/g, 'Math.log')
            .replace(/\bsqrt\b/g, 'Math.sqrt')
            .replace(/\bpi\b/g, 'Math.PI')
            .replace(/\be\b/g, 'Math.E')
            .replace(/\babs\b/g, 'Math.abs');
        
        return this.safeEval(expression);
    }

    showCalculusResult(result) {
        document.getElementById('calculusResult').textContent = result;
    }

    // History Management
    addToHistory(expression, result) {
        const timestamp = new Date();
        this.history.unshift({ 
            expression, 
            result: this.formatResult(result), 
            timestamp 
        });
        
        // Keep only last 50 calculations
        if (this.history.length > 50) {
            this.history.pop();
        }
        
        this.updateHistoryDisplay();
        this.saveHistory();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
            return;
        }
        
        historyList.innerHTML = this.history.map((item, index) => `
            <div class="history-item" onclick="calculator.useHistoryItem(${index})">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">${item.result}</div>
            </div>
        `).join('');
    }

    useHistoryItem(index) {
        const item = this.history[index];
        this.currentResult = item.result.toString();
        this.currentExpression = '';
        this.updateDisplay();
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
        this.saveHistory();
    }

    saveHistory() {
        localStorage.setItem('calculator-history', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('calculator-history');
        if (saved) {
            try {
                this.history = JSON.parse(saved);
                this.updateHistoryDisplay();
            } catch (error) {
                console.error('Error loading history:', error);
                this.history = [];
            }
        }
    }
}

// Initialize calculator
let calculator;
document.addEventListener('DOMContentLoaded', () => {
    calculator = new AdvancedCalculator();
});

// Global functions for button clicks
function appendNumber(num) { calculator.appendNumber(num); }
function appendOperator(op) { calculator.appendOperator(op); }
function appendFunction(func, suffix) { calculator.appendFunction(func, suffix); }
function appendConstant(constant) { calculator.appendConstant(constant); }
function clearAll() { calculator.clearAll(); }
function clearEntry() { calculator.clearEntry(); }
function backspace() { calculator.backspace(); }
function calculate() { calculator.calculate(); }
function calculateDerivative() { calculator.calculateDerivative(); }
function calculateIntegral() { calculator.calculateIntegral(); }
function calculateLimit() { calculator.calculateLimit(); }
function evaluateFunction() { calculator.evaluateFunction(); }
function clearHistory() { calculator.clearHistory(); }

// Keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    if (key >= '0' && key <= '9') {
        calculator.appendNumber(key);
    } else if (key === '.') {
        calculator.appendNumber('.');
    } else if (key === '+') {
        calculator.appendOperator('+');
    } else if (key === '-') {
        calculator.appendOperator('-');
    } else if (key === '*') {
        calculator.appendOperator('*');
    } else if (key === '/') {
        event.preventDefault(); // Prevent browser search
        calculator.appendOperator('/');
    } else if (key === 'Enter' || key === '=') {
        calculator.calculate();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        calculator.clearAll();
    } else if (key === 'Backspace') {
        calculator.backspace();
    }
});