
import React, { useEffect, useRef } from "react";

/**
 * Inyecta estilos CSS para el slider CAPTCHA una sola vez.
 */
const sliderStyleId = "captcha-slider-style";
const injectStyles = () => {
    if (document.getElementById(sliderStyleId)) return;

    const style = document.createElement("style");
    style.id = sliderStyleId;
    style.innerHTML = `
        .custom-slider-container input[type=range] {
            -webkit-appearance: none;
            width: 100%;
            height: 20px;
            background: linear-gradient(to right, #0d6efd 0%, #ddd 0%);
            border-radius: 10px;
            outline: none;
            transition: background 0.3s ease;
        }
        .custom-slider-container input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 30px;
            height: 30px;
            background: #0d6efd;
            border-radius: 50%;
            background-image: url("data:image/svg+xml;utf8,<svg fill='white' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'><path d='M1.5 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 1 1-.708-.708L13.793 8.5H2a.5.5 0 0 1-.5-.5z'/></svg>");
            background-repeat: no-repeat;
            background-position: center;
            background-size: 16px 16px;
            box-shadow: 0 0 4px rgba(0,0,0,0.3);
        }
    `;
    document.head.appendChild(style);
};


/**
 * Componente CAPTCHA tipo slider.
 *
 * Props:
 * - onSuccess: Función que se ejecuta cuando el slider llega a 100%.
 *
 * Funcionalidades:
 * - Usuario debe arrastrar la flecha hasta el final.
 * - Feedback visual cambia según progreso.
 * - Si no se completa correctamente, el slider se reinicia y muestra mensaje de error.
 */
const CaptchaSliderComponent = ({ onSuccess }) => {
    const sliderRef = useRef(null);
    const feedbackRef = useRef(null);

    useEffect(() => {
        injectStyles();

        const slider = sliderRef.current;
        const feedback = feedbackRef.current;

        /**
         * Actualiza visualmente el slider y el mensaje de feedback.
         */
        const updateVisual = () => {
            const val = parseInt(slider.value);
            slider.style.background = `linear-gradient(to right, #0d6efd ${val}%, #ddd ${val}%)`;
            feedback.textContent = val < 100
                ? "⬅️ Arrastra la flecha hasta el final"
                : "✅ Captcha completado";
            feedback.className = `mt-2 ${val < 100 ? "text-muted" : "text-success fw-bold"}`;
        };

        /**
         * Maneja la validación al soltar el slider.
         * Si el valor es 100, llama a onSuccess. Si no, reinicia el slider.
         */
        const handleChange = () => {
            if (parseInt(slider.value) === 100) {
                onSuccess();
            } else {
                slider.value = 0;
                updateVisual();
                feedback.textContent = "⚠️ Debes arrastrar la flecha hasta el final para continuar";
                feedback.className = "mt-2 text-danger fw-bold";
            }
        };

        /**
         * Previene selección de texto y focus accidental mientras se arrastra.
         */
        const handleStart = () => {
            if (window.getSelection) window.getSelection().removeAllRanges();
            if (document.activeElement) document.activeElement.blur();
        };

        updateVisual();
        slider.addEventListener("input", updateVisual);
        slider.addEventListener("change", handleChange);
        slider.addEventListener("pointerdown", handleStart); 
        slider.addEventListener("mousedown", handleStart);   

        return () => {
            slider.removeEventListener("input", updateVisual);
            slider.removeEventListener("change", handleChange);
            slider.removeEventListener("pointerdown", handleStart);
            slider.removeEventListener("mousedown", handleStart);
        };
    }, [onSuccess]);


    return (
        <div className="custom-slider-container mt-3">
            <input ref={sliderRef} type="range" min="0" max="100" step="1" defaultValue="0" />
            <div ref={feedbackRef} className="mt-2 text-muted" style={{ fontSize: "0.9rem" }}>
                ⬅️ Arrastra la flecha
            </div>
        </div>
    );
};

export default CaptchaSliderComponent;

