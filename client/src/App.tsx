import './App.css';
import { useEffect } from 'react';
import { useState } from 'react';
import unidecode from "unidecode";
import {Buffer} from "buffer" 

function App() {
  
    
    enum activeTool  {
      Line,Eraser,Pen,Circle,Square,Rectangle
    }
    // const [lista,setLista] = useState([]);
    var lista = [];
    let videoTiming = 0;
    let activeT; 
    let draw_color = "#12FD0F";
    let draw_width = 5;
    let DrawingMode = false;
    let is_drawing = false;
    let startX,startY;
    let tempCanvas = null as CanvasRenderingContext2D;
    const [imported_image, setImage] = useState("");
    let penInUse = document.getElementById("pen") as HTMLInputElement;
    let lineInUse = document.getElementById("line") as HTMLInputElement;
    let circleInUse = document.getElementById("circle") as HTMLInputElement;
    let squareInUse = document.getElementById("square") as HTMLInputElement;
    let textInUse = document.getElementById("text") as HTMLInputElement;
    let rectangleInUse = document.getElementById("rectangle") as HTMLInputElement;
    let eraserInUse = document.getElementById("eraser") as HTMLInputElement;
    let video = document.querySelector("#Wideo") as HTMLVideoElement;
    let pickacolor = document.getElementById("pickacolor") as HTMLInputElement;
    let colorpicker = document.getElementById("colorpicker") as HTMLElement;
    let change_text_input__left = document.getElementById("change_text_input__left") as HTMLElement;
    let change_text_input__right = document.getElementById("change_text_input__right") as HTMLElement;
    let save_button = document.getElementById("save_button") as HTMLElement;
    let notesContainer = document.getElementById("notesPanel") as HTMLElement;
    
    let change_text_input__click = document.getElementById("change_text_input__click") as HTMLInputElement;
    let set_line_width_slider = document.getElementById("set_line_width_slider") as HTMLInputElement;
    let clear_canvas_button = document.getElementById("clear_canvas_button") as HTMLInputElement;
    let Canvas = document.getElementById("videoDrawCanvas") as HTMLCanvasElement;
    let deleteAllButton = document.getElementById("deleteAllButton") as HTMLButtonElement;
    let ctx =  Canvas.getContext("2d");
    let drawtoolbox =  document.getElementById("drawindtools") as HTMLElement;
    
    var title_window = document.getElementById("title_window");
    var message_window = document.getElementById("message_window");
    var title_window_conf_button = document.getElementById("title_window_confirm") as HTMLButtonElement;
    var message_window_confirm = document.getElementById("message_window_confirm") as HTMLButtonElement;
      var title_window_cancel_button = document.getElementById("title_window_cancel") as HTMLButtonElement;
      var title_window_input = document.getElementById("title_window_input") as HTMLInputElement;
      function CheckNoteName(e,objectInput){
        if(['<','>',':','"','/','\\','|','?','*'].indexOf(e.key) !== -1){
          
          objectInput.value = objectInput.value.replaceAll(e.key,"");
        }
        objectInput.value = unidecode(objectInput.value);
          
          if(objectInput.value.length>150){
            objectInput.value = objectInput.value.substring(0,150);
          }
      }
      
      function RenameNote(oldName,newName){
          var tempList = lista;
          tempList.forEach((elem)=>{
            if (elem["fileName"]==oldName){
              elem["fileName"]=newName;
              lista = (tempList);
              console.log(lista);
              return;
              }
              })
              const formData = new FormData();
              formData.append("request","renameNote");
              formData.append("oldName",oldName);
              formData.append("newName",newName);
              senddata(formData);
              
      }
      function RemoveNote(noteName,HTMLid){
          document.getElementById(HTMLid).remove();
          var tempList = lista;
          tempList.forEach((elem)=>{
            if (elem["fileName"]==noteName){
              const index = tempList.indexOf(elem);
              tempList.splice(index,1);
              lista = (tempList);
              console.log(lista);
              return;
            }
          })
          const formData = new FormData();
          formData.append("request","removeNote");
          formData.append("noteName",noteName);
          senddata(formData);
          
      }
      
     
      
      message_window_confirm.onclick = ()=> message_window.style.visibility = "hidden";
      title_window_input.addEventListener("keyup",(e)=>{
          CheckNoteName(e,title_window_input);        
      })
      title_window_conf_button.onclick = ()=>{
        title_window.style.visibility="hidden";
        saveImage()
      ;};
      title_window_cancel_button.onclick = ()=>{title_window.style.visibility="hidden";};
      // message_window.style.visibility = "visible";
      
    function AddNoteToList(name,listaNotek){
      
      const container = document.getElementById("notesContainer") as HTMLElement;
      var prevVal = "";
      if (!document.getElementById(`NoteElement${name.trim()}`)){
        var note = document.getElementById("noteElementTEMP");
        var copynote = note.cloneNode(true) as HTMLDivElement;
        copynote.setAttribute("class","noteElement");
        copynote.style.display = "flex";
        const input = copynote.querySelector("input") as HTMLInputElement;
        copynote.setAttribute("id",`NoteElement${name}`);
        
        input.setAttribute("id",`input${name}`);
        const label = copynote.querySelector("label") as HTMLLabelElement;
        label.setAttribute("for",`input${name}`);
        copynote.setAttribute("id",`NoteElement${name}`);
        const textarea = copynote.querySelector("textarea") as HTMLTextAreaElement;
        textarea.readOnly = true;
        textarea.value = name;
        const renameNoteSmallButton = copynote.querySelector("#renameNoteSmallButton") as HTMLButtonElement;
        renameNoteSmallButton.onclick = ()=>{
          prevVal = textarea.value;
          let noteRenameOptionHolder = copynote.querySelector("#noteRenameOptionHolder") as HTMLElement;
          noteRenameOptionHolder.style.visibility = "visible";
          textarea.readOnly = false;
        }
        const removeNoteSmallButton = copynote.querySelector("#removeNoteSmallButton") as HTMLButtonElement;
        removeNoteSmallButton.onclick = ()=>{
        RemoveNote(textarea.value.trim(),`NoteElement${textarea.value.trim()}`)
        }
        const cancelSmallButton = copynote.querySelector("#cancelSmallButton") as HTMLButtonElement;
        cancelSmallButton.onclick = ()=>{
          textarea.value = prevVal;
          let noteRenameOptionHolder = copynote.querySelector("#noteRenameOptionHolder") as HTMLElement;
          noteRenameOptionHolder.style.visibility = "hidden";
          textarea.readOnly = true;
        }
        const confirmSmallButton = copynote.querySelector("#confirmSmallButton") as HTMLButtonElement;
        confirmSmallButton.onclick = ()=>{
          for (const element of lista){
            if (element["fileName"]==textarea.value){
              message_window.style.visibility = "visible";
              return;
            }
          }
          let noteRenameOptionHolder = copynote.querySelector("#noteRenameOptionHolder") as HTMLElement;
          noteRenameOptionHolder.style.visibility = "hidden";
          textarea.readOnly = true;
          copynote.setAttribute("id",`NoteElement${textarea.value.trim()}`);
          RenameNote(name,textarea.value.trim());
        }
        textarea.addEventListener( "keyup", (event)=> {CheckNoteName(event,textarea)} );
        textarea.onfocus = (event)=>{ 
          // if (input.checked){} else
        {
          input.checked=true;
          console.log( lista );
          listaNotek.forEach(element => {
            if(element["fileName"]==`${textarea.value}`)
                    {
                      video.currentTime = element["time"];
                      console.log(element["time"]);
                      import_image(textarea.value);
                    }
            }) 
       
        }
        } 
        lista = (listaNotek);
        console.log("lista",lista);
        container.appendChild(copynote);
      }
    }
    
    function RestoreAllNotes(listaNotek){
      
      // lista = data["data"];
      //setLista(data["data"]);
      console.log(`[restore]`,listaNotek);
      listaNotek.forEach((elem)=>{
        AddNoteToList(elem["fileName"],listaNotek);
      })
    }
    
    function getfetcheddata(){
      return fetch('https://react-typescript-videonotes-server.vercel.app/api',{
      })
      .then( response => {
        return response.json().then((data)=>{
          
          RestoreAllNotes(data["data"]);
          //requestForNotesList();
          return data;
        }).catch((err)=>{
          console.log(err);
        })
      }); 
    }
    
    function senddata(data){
      //try {
        fetch("https://react-typescript-videonotes-server.vercel.app/api", {
        method: "POST", // Use POST method
        // headers: {
        //   "Content-Type": 'charset="utf-8"', // Correct content type for JSON
        // },
        body: data, // Send data in request body
      })
      // } catch (error) {
      //   console.log(error);
      // }
      //location.reload();
      
    }
    
    useEffect(()=>{
      getfetcheddata();
      console.log("refresh");
      requestForNotesList();
    },[])
    
    
    
    function requestForNotesList(){
    const formData = new FormData();
    
    formData.append("request","notesList");
    senddata(formData);
    }
    
    function bufferToDataURL(buffer, mimeType) {
      const base64 = buffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
  }
    
    function import_image (imageName) {
      var imgData = new Image();
      var dataURL = "";
      const mimeType = 'image/png';
       {lista.forEach(img=>{
        if (img.fileName==imageName){
          dataURL = bufferToDataURL(img.imgData.imgData, img.imgData.contentType);
          return;
        }
      });
    };
    
    
    console.log(dataURL);
    //var image = new Image(); 
    imgData.src = dataURL;
    ctx.clearRect(0,0,Canvas.width,Canvas.height);
    imgData.onload = function () {
      ctx.drawImage(imgData,0,0,Canvas.width,Canvas.height); 
}

}
    
    function saveImage() {
      if (title_window_input.value == "") {
        console.log("Pusta notka!");
      return;
      };
      //title_window_input.value = title_window_input.value.trim();
      for (const element of lista){
        if (element["fileName"]==title_window_input.value){
          message_window.style.visibility = "visible";
          return;
        }
      }
      let tCan = document.createElement("Canvas") as HTMLCanvasElement;
      tempCanvas = tCan.getContext("2d");
      tCan.style.display = "none";
      tCan.width = Canvas.width;
      tCan.height = Canvas.height;
      tempCanvas.drawImage(Canvas,0,0,Canvas.width,Canvas.height);
      
      var array = lista;
      array.push({"fileName":title_window_input.value,"time":video.currentTime});
      lista = (array);
      console.log(lista);
      const formData = new FormData();
      const sketchNoteBlobPromise = new Promise((resolve) => {
        tCan.toBlob((blob) => {
          if (blob) {
            formData.append("sketchNote", blob, `${unidecode(title_window_input.value)}.png`);
            formData.append("time", ( videoTiming.toString()));
            formData.append("request", ( "saveNote" ));
            // console.log(title_window_input.value);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
      
      
      
      tempCanvas.drawImage(video, 0, 0, Canvas.width, Canvas.height);
      tempCanvas.drawImage(Canvas, 0, 0, Canvas.width, Canvas.height);
    
      const completeNoteBlobPromise = new Promise((resolve) => {
        tCan.toBlob((blob) => {
          if (blob) {
            formData.append("completeNote", blob, `${unidecode(title_window_input.value)}.png`);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    
      Promise.all([sketchNoteBlobPromise, completeNoteBlobPromise]).then(() => {
        senddata(formData);
        tCan.remove();
      });
      AddNoteToList(title_window_input.value.trim(),lista);
  }
  
  
  function RemoveAllNotes(){
    var Tlista = [];
    lista = (Tlista);
    console.log(lista,"Lista cleared");
    ctx.clearRect(0,0,Canvas.width,Canvas.height);
    var elements = document.getElementById("notesContainer");
    for (let i = elements.childNodes.length - 1; i >= 0; i--) {
    let child = elements.childNodes[i];
    if (child.nodeType === Node.ELEMENT_NODE) {
        elements.removeChild(child);
    }
    }
    const formData = new FormData();
    formData.append("request","removeAll");
    senddata(formData);
    
  }
      save_button.onclick = ()=> {
        title_window_input.value = "";
        title_window.style.visibility = "visible";
      };
        
      deleteAllButton.onclick = ()=> {RemoveAllNotes();};
       
   
          
        
 
    
    video.addEventListener("click", ()=>{
      // video.currentTime = 5.387649;
      console.log(video.currentTime);
      })
    penInUse.addEventListener("click", ()=>{
      activeT = activeTool.Pen;
      change_draw_width(draw_width.toString());
      console.log(activeT);
      })
      lineInUse.addEventListener("click", ()=>{
        activeT = activeTool.Line;
        change_draw_width(draw_width.toString());
        console.log(activeT);
        })
        squareInUse.addEventListener("click", ()=>{
          activeT = activeTool.Square;
          change_draw_width(draw_width.toString());
          console.log(activeT);
          })
        rectangleInUse.addEventListener("click", ()=>{
          activeT = activeTool.Rectangle;
          change_draw_width(draw_width.toString());
          console.log(activeT);
          })
          circleInUse.addEventListener("click", ()=>{
            activeT = activeTool.Circle;
            change_draw_width(draw_width.toString());
            console.log(activeT.className);
            })
    eraserInUse.addEventListener("click", ()=>{
      activeT = activeTool.Eraser;
      change_draw_width("50");
      ctx.lineWidth = 50;
      console.log(activeT);
    })
    clear_canvas_button.addEventListener("click", ()=>{
      ctx.clearRect(0,0,Canvas.width,Canvas.height);
    })
    colorpicker.addEventListener("input", ()=>{
      draw_color = pickacolor.value;
      colorpicker.style.borderColor = pickacolor.value;
      // colorpicker.style.backgroundColor = pickacolor.value;
    })
    
    
    function change_draw_width(value){
      set_line_width_slider.value = value;
      change_text_input__click.value = value;
      }
      
      change_text_input__left.onclick = ()=>{
        draw_width -= 1;
        change_draw_width(draw_width);
      };
      change_text_input__right.onclick = ()=>{
        draw_width += 1;
        change_draw_width(draw_width);
      };
      
      change_text_input__click.addEventListener("input", ()=>{
        set_line_width_slider.value = change_text_input__click.value;
       draw_width = parseInt(set_line_width_slider.value);
       })
       set_line_width_slider.addEventListener("input", ()=>{
         change_text_input__click.value = set_line_width_slider.value;
         draw_width = parseInt(set_line_width_slider.value);
    })
      
    
    
    // DrawingMode ? startPen : null,false
    Canvas.addEventListener("touchstart",startStroke,false);
    Canvas.addEventListener("touchmove",drawStroke,false);
    Canvas.addEventListener("mousedown",startStroke,false);
    Canvas.addEventListener("mousemove",drawStroke,false);
    
    Canvas.addEventListener("touchend",stopStroke,false);
    Canvas.addEventListener("mouseup",stopStroke,false);
    Canvas.addEventListener("mouseout",stopStroke,false);
    
    
    window.addEventListener("load",()=>{
      // image.onload = drawImageActualSize;
      colorpicker.style.borderColor = pickacolor.value;
      // colorpicker.style.backgroundColor = pickacolor.value;
      draw_color = pickacolor.value;
      change_text_input__click.value = set_line_width_slider.value;
      draw_width = parseInt(set_line_width_slider.value);
      Canvas.width = Canvas.offsetWidth;
      Canvas.height = Canvas.offsetHeight; 
    })
    
    function create_anchor(event,name){
      let anchor = document.createElement("div");
      anchor.setAttribute("class","anchor_drawing_point");
      anchor.setAttribute("id",name);
      anchor.style.left = event.clientX-6+"px";
      anchor.style.top = event.clientY-6+"px";
      document.body.appendChild(anchor);
      
    }
    
    function startStroke(event){
      is_drawing = true;
      ctx.beginPath();
      startX = event.offsetX;
      startY = event.offsetY;
      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation="source-over";
      
      switch (activeT)
      {
        case activeTool.Line:
            ctx.moveTo(startX,startY);  
            create_anchor(event,"anchor_drawing_point_fixed");
            create_anchor(event,"anchor_drawing_point_float");
            break;
            case activeTool.Circle: 
              create_anchor(event,"anchor_drawing_point_fixed");
              create_anchor(event,"anchor_drawing_point_float");
          // create_anchor(event);
          break;
        case activeTool.Square:
          create_anchor(event,"anchor_drawing_point_fixed");
            create_anchor(event,"anchor_drawing_point_float");
          break;
        case activeTool.Rectangle: 
          create_anchor(event,"anchor_drawing_point_fixed");
            create_anchor(event,"anchor_drawing_point_float");
          break;
      }
            
      
      // ctx?.moveTo(event.clientX - Canvas.offsetLeft,
      //   event.clientY - Canvas.offsetTop);
      event.preventDefault();
      }
      
      function drawStroke(event){
        if(!is_drawing) return
        // ctx.lineTo(event.clientX - Canvas.offsetLeft, 
        // event.clientY - Canvas.offsetTop);
        let float = document.getElementById("anchor_drawing_point_float");
        switch (activeT)
        {
          case activeTool.Pen:
            ctx.lineTo(event.offsetX,event.offsetY);
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = draw_width;
            ctx.stroke();
            break;
            case activeTool.Eraser:
              ctx.globalCompositeOperation="destination-out";
              ctx.lineTo(event.offsetX,event.offsetY);
              ctx.lineCap = "round";
              ctx.lineJoin = "round";
              ctx.stroke();
              break;
              case activeTool.Circle:
                ctx.lineWidth = draw_width;
                float.style.left = event.clientX-6+"px";
                float.style.top = event.clientY-6+"px";
                break;
                case activeTool.Square:
                ctx.lineWidth = draw_width;
                float.style.left = event.clientX-6+"px";
                float.style.top = event.clientY-6+"px";
                break;
                case activeTool.Rectangle:
                ctx.lineWidth = draw_width;
                float.style.left = event.clientX-6+"px";
                float.style.top = event.clientY-6+"px";
                break;
                case activeTool.Line:
                ctx.lineWidth = draw_width;
                float.style.left = event.clientX-6+"px";
                float.style.top = event.clientY-6+"px";
                break;
                }
      
          ctx.strokeStyle = draw_color;
          event.preventDefault();
                
        }
        
        function stopStroke(event){
          if(!is_drawing) return
          switch (activeT)
          {
            case activeTool.Circle:
              ctx.arc(startX,startY, Math.sqrt(Math.pow(event.offsetX-startX,2)+Math.pow(-event.offsetY-(-startY),2)) ,0,2*Math.PI,true);
            ctx.stroke();
            console.log(Math.sqrt(Math.pow(event.offsetX-startX,2)+Math.pow(-event.offsetY-(-startY),2)));
            break;
            case activeTool.Square:
              let a = Math.sqrt(Math.pow(event.offsetX-startX,2)+Math.pow(-event.offsetY-(-startY),2));
              ctx.strokeRect(startX-((a/Math.sqrt(2))),startY-((a/Math.sqrt(2))),a*(2/Math.sqrt(2)),a*(2/Math.sqrt(2)));
            break;
            case activeTool.Rectangle:
              ctx.strokeRect(startX,startY,event.offsetX-startX,event.offsetY-startY);
            ctx.stroke();
            break;
            case activeTool.Line:
              ctx.lineTo(event.offsetX,event.offsetY);
              ctx.stroke();
            break;
          }
          const del = document.querySelectorAll("#anchor_drawing_point_fixed, #anchor_drawing_point_float");
          del.forEach((item)=>{
            document.getElementById(item.id).remove();
          })
          // ctx.closePath();
          is_drawing = false;
          event.preventDefault();
    }
    
   
    
    var editButton = document.getElementById("editcheck") as HTMLInputElement;
    editButton?.addEventListener("click", ()=>{
      if(editButton.checked){
        notesContainer.style.visibility = "visible";
        ctx.clearRect(0,0,Canvas.width,Canvas.height);
        video.pause();
        videoTiming = video.currentTime;
        DrawingMode = true;
        console.log(DrawingMode);
        Canvas.style.visibility = "visible";
        video.controls = false;
        drawtoolbox.style.visibility = "visible";
        }else
        {
          notesContainer.style.visibility = "hidden";
          DrawingMode = false;
          drawtoolbox.style.visibility = "hidden";
          title_window.style.visibility = "hidden";
          Canvas.style.visibility = "hidden";
        video.controls = true;
      }
    })
    
    
  
 
  
  return (
    <div className="App">
      {/* <header className="App-header">
      </header> */}
    </div>
   
  );
}

export default App;
