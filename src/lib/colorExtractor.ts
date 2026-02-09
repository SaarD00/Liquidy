// Extract dominant colors from an image URL using canvas
export async function extractColorsFromImage(imageUrl: string): Promise<{
    primary: string;
    secondary: string;
    accent: string;
}> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(getDefaultColors());
                    return;
                }

                // Use small size for sampling
                const size = 50;
                canvas.width = size;
                canvas.height = size;

                ctx.drawImage(img, 0, 0, size, size);

                const imageData = ctx.getImageData(0, 0, size, size).data;

                // Sample colors from different regions
                const colors: { r: number; g: number; b: number }[] = [];

                // Sample from corners and center
                const regions = [
                    { x: 0, y: 0 },                    // top-left
                    { x: size - 10, y: 0 },            // top-right
                    { x: 0, y: size - 10 },            // bottom-left
                    { x: size - 10, y: size - 10 },    // bottom-right
                    { x: size / 2 - 5, y: size / 2 - 5 } // center
                ];

                regions.forEach(region => {
                    const pixelIndex = (Math.floor(region.y) * size + Math.floor(region.x)) * 4;
                    colors.push({
                        r: imageData[pixelIndex],
                        g: imageData[pixelIndex + 1],
                        b: imageData[pixelIndex + 2]
                    });
                });

                // Get average colors and boost saturation
                const primary = boostSaturation(colors[4] || colors[0]); // center or top-left
                const secondary = boostSaturation(colors[0]);
                const accent = boostSaturation(colors[2] || colors[1]);

                resolve({
                    primary: `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.4)`,
                    secondary: `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.35)`,
                    accent: `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.25)`
                });
            } catch (error) {
                resolve(getDefaultColors());
            }
        };

        img.onerror = () => {
            resolve(getDefaultColors());
        };

        img.src = imageUrl;
    });
}

// Boost saturation to make colors more vibrant
function boostSaturation(color: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    // Convert to HSL
    const r = color.r / 255;
    const g = color.g / 255;
    const b = color.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    // Boost saturation by 50% (max 1.0)
    s = Math.min(1, s * 1.5);

    // Convert back to RGB
    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
        r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
    };
}

function getDefaultColors() {
    return {
        primary: 'rgba(139, 92, 246, 0.4)',
        secondary: 'rgba(236, 72, 153, 0.35)',
        accent: 'rgba(6, 182, 212, 0.25)'
    };
}
