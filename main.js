let itemlist = [];
let checkinglist = [];
let button=document.querySelector('button');
let input=document.querySelector('input');

button.addEventListener('click',clickButton);

function clickButton(){
    if(input.value!=""){
    itemlist.push(input.value);
    checkinglist.push(input.value);
    input.value="";
    input.focus();
    
    }
    show();
}

function show(){
    let list1="";
    for(let i=0; i<itemlist.length; i++){
        list1+="<li>"+itemlist[i]+"<span class='close' id="+i+">"+"        \u00D7"+"</span></li>";
    }
    document.querySelector("#list").innerHTML=list1;
    if(itemlist.length!=0){
        document.getElementById('left').innerHTML="남은 일이 "+checkinglist.length+"개 있어요";
    }else{
        document.getElementById('left').innerHTML="남은 일이 없어요";
    }
    let deletebutton=document.querySelectorAll(".close");
    for(let i=0; i<deletebutton.length; i++){
        deletebutton[i].addEventListener("click",deleteItem);
    }
    
}

function deleteItem(){
    let id=this.getAttribute("id");
    itemlist.splice(id,1);
    show();
}

let checklist=document.querySelector('#list');
checklist.addEventListener('click',event=>{
    if(event.target.tagName==='LI'){
        event.target.classList.toggle('checked');
        let id=this.getAttribute("id");
        checkinglist.splice(id,1);
    }
});