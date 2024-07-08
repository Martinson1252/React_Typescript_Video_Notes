import  express from "express";
import cors from "cors";
import fs from "fs";
import {dirname,join,extname} from "path";
import multer from "multer";
import unidecode from "unidecode";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// const { createCanvas, loadImage, Image } = require('canvas');
const app = express();
// const app =require("express");
// const fs = require("fs");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const PORT = 8080;
var list = [];
var sketchesPath = join(__dirname,`./sketch_notes/`);
var completeNotesPath = join(__dirname,`./complete_notes/`);

app.use(cors());


app.use(express.json())
app.options("/api", (req, res) => {
    // CORS preflight handling
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.set({ 'content-type': 'application/json; charset=utf-8' });
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private','no-cors');
    res.sendStatus(204);
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  });

app.listen(PORT, ()=> { console.log("server started port: "+PORT)});

function send(dataToSend)
{
    app.get("/api", (req,res) =>{
      res.clearCookie();
      res.send({data:dataToSend});
      // const {dane} = res.body
      console.log("Sent:",dataToSend);
});
}





function ListNotes() {
  const lista = [];
  const folderpath = sketchesPath;
  fs.readdir(folderpath, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    
    
    

    const filePromises = files.map(file => {
      if (extname(file) === ".png") {
        const f = file.replace(".png", ".txt");
        return fs.promises.readFile(join(folderpath, f), 'utf8')
          .then(data => {
            const image = {
              imgData: fs.readFileSync(join(folderpath,file),{encoding:'base64'}),
              //
              contentType: `image/${extname(file).substring(1)}`
            };
            console.log("img",image);
            lista.push({ "fileName": file.replace(".png", ""), "time": data, "imgData": image });
          })
          .catch(err => console.error(err));
      }
    });   
      
    
    //const sendData = new Promise( ()=> send(lista));
    Promise.all(filePromises).then(() => {
      console.log("ListNotes() ", lista);
      var dane = "";
      lista.forEach(elem =>{
        dane += `${elem["fileName"]} ${elem["time"]}\n`;
      })
      fs.promises.writeFile("./notes.txt",dane,'utf8', (err)=>{
        
      });       
      send(lista);
    });
  });
}


function restart() {
  // app.get("/restart", (_, res) => {
  //   process.exit(0);
  // });
  ListNotes();
}

function RemoveAllNotes(){
  const folderpath1 = sketchesPath;
  const folderpath2 = completeNotesPath;
  fs.readdir(folderpath1, (err, files) => {
    files.forEach(file => {
          fs.rm(folderpath1+file, (err, data) => {
            if (err) {
              console.error(err);
              return;
            }         
          });});});
  fs.readdir(folderpath2, (err, files) => {
    files.forEach(file => {
          fs.rm(folderpath2+file, (err, data) => {
            if (err) {
              console.error(err);
              return;
            }         
          });});});
  
          restart();
}

//ListNotes();

function SaveNote(req,res){
  const filePath1 = `${completeNotesPath}${req.files.completeNote[0].originalname}`;
  const filePath2 = `${sketchesPath}${req.files.sketchNote[0].originalname}`;
  const textFile = req.files.sketchNote[0].originalname.replace(".png",".txt");
  const textFilePath = `${sketchesPath}${textFile}`;
  //saving completeNote
  fs.writeFile(filePath1, req.files.completeNote[0].buffer, 'utf8', (err) => {
    if (err) {
      console.error('Error saving file:', err);
      res.status(500).send('Error saving file');
    } else {
      console.log('File saved:', filePath1);
    }
  }); //saving sketchNote
  fs.writeFile(filePath2, req.files.sketchNote[0].buffer, 'utf8' ,(err) => {
    if (err) {
      console.error('Error saving file:', err);
      res.status(500).send('Error saving file');
    } else {
      console.log('File saved:', filePath2);
    }
  }); //saving time file
  fs.writeFile(textFilePath, req.body.time, (err) => {
    if (err) {
      console.error('Error saving file:', err);
      res.status(500).send('Error saving file');
    } else {
      console.log('File saved:', textFilePath);
    }
  });
  restart();
      
  }
    
    function RemoveNote(req){
      const folderpath1 = sketchesPath;
      const folderpath2 = completeNotesPath;
      fs.readdir(folderpath1, (err, files) => {
        files.forEach(file => {
          if (file.replaceAll(".png","") == (req.body.noteName)){
              fs.rm(folderpath1+file, (err, data) => {
                if (err) {
                  console.error(err);
                  return;
                }         
              });
              fs.rm(folderpath1+file.replaceAll(".png",".txt"), (err, data) => {
                if (err) {
                  console.error(err);
                  return;
                }         
              });
          }
            });
          
          });
      fs.readdir(folderpath2, (err, files) => {
        files.forEach(file => {
          if (file.replaceAll(".png","") == (req.body.noteName)){
              fs.rm(folderpath2+file, (err, data) => {
                if (err) {
                  console.error(err);
                  return;
                }         
              });
          }
            });});
      
              restart();
    }

    
    function RenameNote(req,res){
      const folderpath1 = completeNotesPath;
      const folderpath2 = sketchesPath;
      const filePath1old = `${completeNotesPath}${req.body.oldName}`;
      const filePath1new = `${completeNotesPath}${req.body.newName}`;
      const filePath2old = `${sketchesPath}${req.body.oldName}`;
      const filePath2new = `${sketchesPath}${req.body.newName}`;
      
      fs.readdir(folderpath1, (err, files) => {
        files.forEach(file => {
          if (file.replaceAll(".png","") == (req.body.oldName))
              fs.rename(filePath1old+".png", filePath1new+".png" , (err, data) => {
                if (err) {
                  console.error(err);
                  return;
                }         
              });
            
            });});
      fs.readdir(folderpath2, (err, files) => {
        files.forEach(file => {
          if (file.replaceAll(".png","") == (req.body.oldName)){
              fs.rename(filePath2old+".png", filePath2new+".png" , (err, data) => {
                if (err) {
                  console.error(err);
                  return;
                }         
              })
              fs.rename(filePath2old+".txt", filePath2new+".txt" , (err, data) => {
                if (err) {
                  console.error(err);
                  return;
                }         
              })
            }
            ;}
          
          );});
          restart();
    }
  

// send("dddata");

app.post("/api", upload.fields([{name:'sketchNote',maxCount:1},{name:'completeNote',maxCount:1}]) ,(req, res) => {
  console.log(req.body.request);
  switch (req.body.request){
    
    case "saveNote":
      
      if (req.files) {
        console.log(req.body.time);
        console.log(req.files.completeNote[0].buffer); // Log the received data for completeNote
        console.log(req.files.sketchNote[0].buffer); // Log the received data for sketchNote
        console.log( (unidecode(req.files.sketchNote[0].originalname)) )
        SaveNote(req, res);
        } else {
          res.status(400).send({ error: "One or both files are missing" });
        }
        break;

  case "removeAll":
    RemoveAllNotes();
  break;
  
  case "removeNote":
    RemoveNote(req);
  break;
  
  case "renameNote":
    RenameNote(req,res);
  break;
  
  case "notesList":
      
  ListNotes()
  break;
}
    
  });
  
 export default app;