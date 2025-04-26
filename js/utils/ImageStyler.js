/**
 * ImageStyler.js
 * Utility for stylizing images to match the fantasy game aesthetic
 */

class ImageStyler {
    /**
     * Stylize an image to match the fantasy game aesthetic
     * @param {HTMLImageElement} sourceImage - The source image to stylize
     * @param {Object} options - Stylization options
     * @param {number} options.saturationReduction - Amount to reduce saturation (0-1, default: 0.15)
     * @param {number} options.blurAmount - Amount of blur to apply (0-5, default: 1.5)
     * @param {number} options.posterizeLevels - Number of color levels for posterization (2-32, default: 10)
     * @param {number} options.bloomStrength - Strength of bloom effect (0-1, default: 0.2)
     * @returns {HTMLCanvasElement} - Canvas with the stylized image
     */
    static stylizeImage(sourceImage, options = {}) {
        // Set default options
        const settings = {
            saturationReduction: options.saturationReduction !== undefined ? options.saturationReduction : 0.15,
            blurAmount: options.blurAmount !== undefined ? options.blurAmount : 1.5,
            posterizeLevels: options.posterizeLevels !== undefined ? options.posterizeLevels : 10,
            bloomStrength: options.bloomStrength !== undefined ? options.bloomStrength : 0.2
        };
        
        // Create canvas and get context
        const canvas = document.createElement('canvas');
        canvas.width = sourceImage.width;
        canvas.height = sourceImage.height;
        const ctx = canvas.getContext('2d');
        
        // Draw original image
        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Create a copy for bloom effect
        const bloomData = new Uint8ClampedArray(data);
        
        // Apply effects to each pixel
        for (let i = 0; i < data.length; i += 4) {
            // Get RGB values
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // Convert to HSL
            const hsl = this.rgbToHsl(r, g, b);
            
            // Reduce saturation
            hsl[1] = Math.max(0, hsl[1] - settings.saturationReduction);
            
            // Convert back to RGB
            const rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);
            
            // Apply posterization
            r = Math.round(rgb[0] / 255 * settings.posterizeLevels) / settings.posterizeLevels * 255;
            g = Math.round(rgb[1] / 255 * settings.posterizeLevels) / settings.posterizeLevels * 255;
            b = Math.round(rgb[2] / 255 * settings.posterizeLevels) / settings.posterizeLevels * 255;
            
            // Store processed values
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
            
            // Store for bloom effect
            bloomData[i] = r;
            bloomData[i + 1] = g;
            bloomData[i + 2] = b;
        }
        
        // Put processed image data back to canvas
        ctx.putImageData(imageData, 0, 0);
        
        // Apply blur (if requested)
        if (settings.blurAmount > 0) {
            ctx.filter = `blur(${settings.blurAmount}px)`;
            ctx.drawImage(canvas, 0, 0);
            ctx.filter = 'none';
        }
        
        // Apply bloom effect (if requested)
        if (settings.bloomStrength > 0) {
            // Create a temporary canvas for the bloom
            const bloomCanvas = document.createElement('canvas');
            bloomCanvas.width = canvas.width;
            bloomCanvas.height = canvas.height;
            const bloomCtx = bloomCanvas.getContext('2d');
            
            // Create image data from bloom data
            const bloomImageData = new ImageData(bloomData, canvas.width, canvas.height);
            bloomCtx.putImageData(bloomImageData, 0, 0);
            
            // Apply blur to bloom canvas
            bloomCtx.filter = `blur(3px)`;
            bloomCtx.drawImage(bloomCanvas, 0, 0);
            
            // Blend bloom with original
            ctx.globalAlpha = settings.bloomStrength;
            ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(bloomCanvas, 0, 0);
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
        }
        
        return canvas;
    }
    
    /**
     * Convert RGB to HSL
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {Array} - [h, s, l] values (h: 0-1, s: 0-1, l: 0-1)
     */
    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return [h, s, l];
    }
    
    /**
     * Convert HSL to RGB
     * @param {number} h - Hue (0-1)
     * @param {number} s - Saturation (0-1)
     * @param {number} l - Lightness (0-1)
     * @returns {Array} - [r, g, b] values (0-255)
     */
    static hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [r * 255, g * 255, b * 255];
    }
}

// Export the ImageStyler class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImageStyler };
}
