/**
 * @param element1 {HTMLElement}
 * @param element2 {HTMLElement}
 */
export async function animateChange(element1, element2)
{
    const content = document.getElementById("content");
    content.classList.add("gone");
    await new Promise(r => setTimeout(r, 600));
    element1.classList.add("hidden");
    element2.classList.remove("hidden");
    content.classList.remove("gone");
    await new Promise(r => setTimeout(r, 600));
}