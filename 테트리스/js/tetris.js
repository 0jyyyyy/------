import BLOCKS from "./blocks.js"
// DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay =document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem; // 잠깐 블럭을 담아두는 용도

const movingItem = { // 실질적인 다음 블럭의 타입과 좌표 등의 정보
    type : "",
    direction: 3, //블럭을 돌릴때 사용
    top: 0, // 좌표 기준 블럭 높이
    left: 0, // 좌표 기준 블럭 위치
};

 init()

// functions
function init(){
    tempMovingItem = {...movingItem }; //... spread 아이템을 이용하여, 안에 내용만 가져온다.
    for(let i=0; i<GAME_ROWS; i++){
        prependNewLine()
    }
    generateNewBlock()
}

function prependNewLine(){
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for(let j=0; j<GAME_COLS; j++){
        const metrix = document.createElement("li");
        ul.prepend(metrix)
    }
    li.prepend(ul)
    playground.prepend(li)
}

function renderBlocks(moveType=""){
    const{ type, direction, top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving=>{
        moving.classList.remove(type,"moving");
    })
    BLOCKS[type][direction].some(block => { // foreach 대신 some을 사용하면 원하는 위치에서 반복문이 종료되게 할수있다.
        const x = block[0] + left;
        const y = block[1] + top;
        //삼항연산자를 사용
        
        const target =  playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if(isAvailable){ // checkEmpty가 null이 아니면
            target.classList.add(type, "moving")
        }else{// 재귀함수 호출 (블럭이 옆으로 가도 프레임을 넘어가지않게 하는 효과)
            tempMovingItem = {...movingItem }
            if(moveType == "retry"){
                clearInterval(downInterval)
                showGameoverText()//게임오버
            }
            setTimeout(() => {
                renderBlocks("retry"); 
                if(moveType == "top"){ // 블럭이 더이상 내려가지 않게 하기위해
                    seizeBlock();
                }
            },0)
            return true;
        }
    })
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;  
}

function seizeBlock(){
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving=>{
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch()
}
function checkMatch(){
    
    const childNodes = playground.childNodes;
    childNodes.forEach(child => {
        let matched = true;
        child.children[0].childNodes.forEach(li=>{
            if(!li.classList.contains("seized")){ // 하나라도 seized가 없으면 줄이 없어지지않음
                matched = false;
            }
        })
        if(matched){ // 줄이 없어짐과 동시에 새로운 한줄이 추가된다.
            child.remove();
            prependNewLine()
            score++; 
            scoreDisplay.innerText = score; // 한줄이 없어질때마다 1점씩 추가
        }
    })

    generateNewBlock()
}

function generateNewBlock(){

    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock("top", 1)    
    },duration)

    const blockArray = Object.entries(BLOCKS); 
    const randomIndex = Math.floor(Math.random() * blockArray.length)
    
    movingItem.type=blockArray[randomIndex][0]
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = {...movingItem };
    renderBlocks()
}

function checkEmpty(target){
    if(!target || target.classList.contains("seized")){
        return false;
    }
    return true;
}

function moveBlock(moveType, amount){
    tempMovingItem[moveType] += amount 
    renderBlocks(moveType)
}

function changeDirection(){
    const direction = tempMovingItem.direction;
    direction == 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction +=1;
    renderBlocks()
}
function dropBlock(){ // 스페이스바를 누르면 한번에 내려가는 함수
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock("top",1)
    }, 10);
}
function showGameoverText(){ //게임오버시 나오는 텍스트
    gameText.style.display = "flex"
}
// event handling
document.addEventListener("keydown", e=> {
    switch(e.keyCode){
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left",-1);
            break;
        case 40:
            moveBlock("top", 1);
            break;
        case 38:
            changeDirection();
            break;
        case 32:
            dropBlock();
            break;
        default:
            break;
    }
    // console.log(e)

}) 

restartButton.addEventListener("click",()=>{
    playground.innerHTML = "";
    gameText.style.display = "none"
    init()
})