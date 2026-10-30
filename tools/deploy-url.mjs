export function replaceAssetReference(text,from,to){
 const escaped=from.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return text.replace(new RegExp(escaped+`(?=[?#"'\\s),<>]|$)`,'g'),()=>to);
}
