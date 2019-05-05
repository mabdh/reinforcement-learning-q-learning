import { deflateRaw } from "zlib";

class State{
    constructor(pos,up,down,left,right, H, W){
        this.pos = pos
        this.actions = [up,down,left,right]
        this.obstacle = false
        this.start = false
        this.finish = false
        this.H = H
        this.W = W
        this.optimal_action = null
    }
}


function draw(state_table, q_table, canvas){
    let ctx = canvas.getContext("2d");

    let hn = state_table.length
    let wn = state_table[0].length

    let height = 500
    let width = 500

    ctx.canvas.width  = width;
    ctx.canvas.height = height;

    let y_start = 0
    let y_end = height
    let step_size_w = parseInt(width / wn)
    let step_size_h = parseInt(height / hn)

    for (var x = 0; x < width; x+=step_size_w){
        // line = ((x, y_start), (x, y_end))
        // draw.line(line, fill=128)

        ctx.moveTo(x, y_start);
        ctx.lineTo(x, y_end);
        ctx.stroke();
    }

    let x_start = 0
    let x_end = width

    for (var y = 0; y < height; y+=step_size_h){
        ctx.moveTo(x_start, y);
        ctx.lineTo(x_end, y);
        ctx.stroke();
    }
    
    // # obstacle
    // font=ImageFont.truetype("/Library/Fonts/Arial Unicode.ttf", 30)
    let font_w = parseInt(step_size_w / 2)
    let str_font = font_w.toString().concat("px Arial")
    ctx.font = str_font
    for (var i = 0; i < hn; i++){
        // # str_row = ""
        for (var j = 0; j < wn; j++){
            if (state_table[i][j].obstacle){
                // draw.rectangle([j*step_size_w,i*step_size_h,(j+1)*step_size_w,(i+1)*step_size_h],fill=0)
                // ctx.fillRect(j*step_size_w, i*step_size_h, step_size_w, step_size_h);
                let icon = "\u2623"
                ctx.fillText(icon, j*step_size_w+parseInt(step_size_w/2)-parseInt(font_w/2), i*step_size_h+parseInt(step_size_h/2)+parseInt(font_w/2));
                
            }
            if (state_table[i][j].start){
                let icon = "\u26C4"
                ctx.fillText(icon, j*step_size_w+parseInt(step_size_w/2)-parseInt(font_w/2), i*step_size_h+parseInt(step_size_h/2)+parseInt(font_w/2));
                // draw.rectangle([j*step_size_w,i*step_size_h,(j+1)*step_size_w,(i+1)*step_size_h])
                // ctx.fillRect(j*step_size_w, i*step_size_h, (j+1)*step_size_w, (i+1)*step_size_h);
            
            }
            if (state_table[i][j].finish){
                let icon = "\u26FA"
                ctx.fillText(icon, j*step_size_w+parseInt(step_size_w/2)-parseInt(font_w/2), i*step_size_h+parseInt(step_size_h/2)+parseInt(font_w/2));
                // draw.text([j*step_size_w+(step_size_w/3),i*step_size_h],icon,font=font)
            }
            if (state_table[i][j].optimal_action){ //:# and not state_table[i][j].start){
                let icon = state_table[i][j].optimal_action
                ctx.fillText(icon, j*step_size_w+parseInt(step_size_w/2)-parseInt(font_w/2), i*step_size_h+parseInt(step_size_h/2)+parseInt(font_w/2));
                // draw.text([j*step_size_w+(step_size_w/3),i*step_size_h],icon,font=font)
            }
        }
        // # print(str_row)
        // console.log(str_row)
    }

}


function get_numeric_from_pos(H,W,pos){
    return pos[0] * W + pos[1]
}

function get_pos_from_numeric(H,W,numeric){
    return [parseInt(numeric/W),parseInt(numeric%W)]
}

function generate_environment( H,W){
    var state_table = []
    for (var row = 0; row < H; row++) {
        let state_row = []
        let up = null
        let down = null
        let left = null
        let right = null
        for (var col = 0; col < W; col++) {
            let pos = [row,col]
            if (row - 1 >= 0){
                up = [row-1,col]
            }
            if (row + 1 < H){
                down = [row+1,col]
            }
            if (col - 1 >= 0){
                left = [row,col-1]
            }
            if (col + 1 < W){
                right = [row,col+1]
            }
            let state = new State(pos,up,down,left,right, H, W)
            state_row.push(state)
        }
        state_table.push(state_row)
    }
    return state_table
}

function assign_start(state_table, row, col){
    if (row > (state_table.length - 1)){
        console.log("Row is out of bound")
    }
    if (col > (state_table[0].length - 1)){
        console.log("Col is out of bound")
    }
    state_table[row][col].start = true
    return state_table
}
function assign_finish(state_table, row, col){
    if (row > (state_table.length - 1)){
        console.log("Row is out of bound")
    }
    if (col > (state_table[0].length - 1)){
        console.log("Col is out of bound")
    }
    state_table[row][col].finish = true
    return state_table
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}  

function assign_obstacle(state_table, n_obstacle_per_line){
    for (var i = 0; i < state_table.length; i++) {
        let idx_random = []
        for (var idx = 0; idx < n_obstacle_per_line; idx++) {
            idx_random.push(getRandomInt(state_table[i].length))
        }
        for (var idx = 0; idx < idx_random.length; idx++) {
            if (state_table[i][idx_random[idx]].start || state_table[i][idx_random[idx]].finish){
                state_table[i][idx_random[idx]].obstacle = null
            }
            else{
                state_table[i][idx_random[idx]].obstacle = true 
            }
        }
    }
    return state_table
}

function print_environment(state_table){
    console.log()
    for (var i = 0; i < state_table.length; i++) {
        let str_row = ""
        for (var j = 0; j < state_table[i].length; j++) {
            let icon = "X" 
            if (state_table[i][j].obstacle){
                icon = "X"
            } else { 
                icon = "_"
            }
            if (state_table[i][j].start){
                icon = "S"
            }
            if (state_table[i][j].finish){
                icon = "F"
            }
            if (state_table[i][j].optimal_action){
                icon = state_table[i][j].optimal_action
            }
            str_row += icon
        }
        console.log(str_row)
    }
    console.log()
}

function generate_Q_table(state_table, nst, nac){
    // #           Action
    // #           0   1   2
    // # State   0 []  []  []
    // #         1 []  []  []

    var qt = []
    let num_states = parseInt(nst)
    let num_actions = parseInt(nac)
    
    
    for (var i = 0; i < num_states;i++){
        var new_row = new Array(num_actions)
        for (var j = 0; j < num_actions;j++){
            new_row[j] = 0.0
        }
        qt.push(new_row)
    }
    
    console.log(qt)

    for (var s = 0; s < num_states; s++) {
        for (var a = 0; a < num_actions; a++) {
            let pos = get_pos_from_numeric(H,W,s)
            let next_pos = state_table[pos[0]][pos[1]].actions[a]
            if (next_pos === null || next_pos === undefined){
                qt[s][a] += -1.0
                continue
            }
        }
    }
    
    return qt
}


function generate_R_table(state_table, num_states, num_actions){
    // #           Action
    // #           0   1   2
    // # State   0 []  []  []
    // #         1 []  []  []
    
    var [r, c] = [num_states, num_actions]; 
    var r_table = Array(r).fill().map(()=>Array(c).fill(0));
    
    for (var i = 0; i < num_states; i++) {
        for (var j = 0; j < num_actions; j++) {
            r_table[i][j] += -0.001
        }
    }
    
    for (var s = 0; s < num_states; s++) {
        for (var a = 0; a < num_actions; a++) {
            let pos = get_pos_from_numeric(H,W,s)

            let next_pos = state_table[pos[0]][pos[1]].actions[a]
            if (next_pos == null){
                r_table[s][a] += -0.3
                continue
            }
            if (state_table[next_pos[0]][next_pos[1]].obstacle){
                r_table[s][a] += -0.99
            }
            if (state_table[next_pos[0]][next_pos[1]].finish){
                r_table[s][a] += 1
            }
        }
    }
    return r_table
}
      
function delay(ms) {
    var cur_d = new Date();
    var cur_ticks = cur_d.getTime();
    var ms_passed = 0;
    while(ms_passed < ms) {
        var d = new Date();
        var ticks = d.getTime();
        ms_passed = ticks - cur_ticks;
    }
}

const delayPromise = ms => new Promise(_ => setTimeout(_, ms));

var rewards = []


function train(state_table, q_table){
    let epsilon = max_epsilon
    let count = 0

    for (var episode = 0; episode < total_episodes; episode++) {
        // Reset environment

        let state_num = get_numeric_from_pos(H,W,state_table[start_point[0]][start_point[1]].pos)
        let step = 0
        let total_rewards = 0
        
        let test_state_table = JSON.parse(JSON.stringify(state_table));
        let action = null
        
        for (var step = 0; step < max_steps; step++) {
            let exp_exp_tradeoff = Math.random()
            // exploitation
            if (exp_exp_tradeoff > epsilon){
                let q_row = q_table[state_num]
                action = q_row.indexOf(Math.max.apply(null, q_row))
            }
            else{
                // exploration
                action = getRandomInt(action_space_size)
                
            }

            // do action a, observe next state s, and reward r
            let state_pos = get_pos_from_numeric(H,W,state_num)
            let new_state_pos = state_table[state_pos[0]][state_pos[1]].actions[action]
            
            test_state_table[state_pos[0]][state_pos[1]].optimal_action = action_icon[action]
            draw(test_state_table,q_table,canvas)
            count += 1
            
            if (new_state_pos === null || new_state_pos === undefined){
                break
            }
            
            let new_state_num = get_numeric_from_pos(H,W,new_state_pos)
            
            
            let q_row = q_table[new_state_num]
            // Bellman eq
            q_table[state_num][action] += learning_rate * (r_table[state_num][action] + gamma * Math.max.apply(null, q_row) - q_table[state_num][action])
            
            
            total_rewards += r_table[state_num][action]
            
            state_num = new_state_num
            
            // break if finish
            if (state_table[new_state_pos[0]][new_state_pos[1]].finish){ 
                break
            }
        }
        
        draw(test_state_table,q_table,canvas)
        // Reduce epsilon, move toward exploitation
        epsilon = min_epsilon + (max_epsilon - min_epsilon)* Math.exp(-decay_rate*episode) 
        rewards.push(total_rewards)
    }
    let strout = "Training Finished\nScore over time: "
    let score = rewards.reduce((a, b) => a + b, 0)/total_episodes
    strout = strout.concat(score.toString())
    strout = strout.concat("\nMax episode: ")
    strout = strout.concat(total_episodes.toString())
    console.log(strout)
    alert(strout)
    
    overlay_off()
}

function play(state_table, q_table){

    let count = 0
    for (var episode = 0; episode < 10; episode++) {
        let state_num = get_numeric_from_pos(H,W, start_point)
        
        for (var step = 0; step < max_steps; step++) {
            
            let q_row = q_table[state_num]
            let action = q_row.indexOf(Math.max.apply(null, q_row))
            let state_pos = get_pos_from_numeric(H,W,state_num)
            state_table[state_pos[0]][state_pos[1]].optimal_action = action_icon[action]

            let new_state_pos = state_table[state_pos[0]][state_pos[1]].actions[action]
            if (new_state_pos === null || new_state_pos === undefined){
                break
            }

            if (state_table[new_state_pos[0]][new_state_pos[1]].finish){
                // print("Number of steps", step)
                break
            }
            state_num = get_numeric_from_pos(H,W,new_state_pos)
        }
    }
    print_environment(state_table)
    draw(state_table, q_table, canvas)
}


var H = 4
var W = 4
var n_obstacle_per_line = 1

var start_point = [0,2]
var finish_point = [2,3]

var action_space_size = 4
    
var total_episodes = 5000        
var learning_rate = 0.8           
var max_steps = 99                
var gamma = 0.95                  

            
var max_epsilon = 1.0             
var min_epsilon = 0.01            
var decay_rate = 0.005         
    

var action_space = {
    "up" : 0,
    "down" : 1,
    "left" : 2,
    "right" : 3
}

var action_icon = {
    0:'\u2191',
    1:'\u2193',
    2:'\u2190',
    3:'\u2192'
}

var meter = document.getElementsByTagName("meter")[0];
var canvas = document.getElementById('canvas');

var state_table = []
var q_table = []
var r_table = []

function reinit(){
state_table = generate_environment(H,W)

state_table = assign_start(state_table, start_point[0], start_point[1])
state_table = assign_finish(state_table, finish_point[0], finish_point[1])
state_table = assign_obstacle(state_table, n_obstacle_per_line)
print_environment(state_table)

q_table = generate_Q_table(state_table, H*W, action_space_size)
r_table = generate_R_table(state_table, H*W, action_space_size)

draw(state_table, q_table, canvas)
}

document.getElementById('button-grid-size-n').addEventListener('click', ()=>{
    try{
        let gridsize = document.getElementById('txt-grid-size').value
        
        H = parseInt(gridsize)
        W = parseInt(gridsize)
        reinit()

    }
    catch (err){
        
    }
    draw(state_table, q_table, canvas)
});

document.getElementById('button-assign-start').addEventListener('click', ()=>{
    try {
        let startpoint = document.getElementById('txt-start-point').value
        startpoint = startpoint.split(",")
        start_point = [parseInt(startpoint[0]),parseInt(startpoint[1])]
        reinit()
    }
    catch (err){

    }
    draw(state_table, q_table, canvas)
});

document.getElementById('button-assign-finish').addEventListener('click', ()=>{
    try{
        let finishpoint = document.getElementById('txt-finish-point').value
        finishpoint = finishpoint.split(",")
        finish_point = [parseInt(finishpoint[0]),parseInt(finishpoint[1])]
        reinit()

    }
    catch (err){
        
    }
    draw(state_table, q_table, canvas)
});

document.getElementById('button-num-obstacles-per-row').addEventListener('click', ()=>{
    try{
        let nobs = document.getElementById('txt-num-obstacles').value
        n_obstacle_per_line = parseInt(nobs)
        reinit()

    }
    catch (err){
        
    }
    draw(state_table, q_table, canvas)
});

document.getElementById('button-train').addEventListener('click', ()=>{
    try{
        let numeps = document.getElementById('txt-num-episode').value
        total_episodes = parseInt(numeps)

    }
    catch (err){
        
    }
    overlay_on()
    delayPromise(1000).then(() => train(state_table,q_table));
});

function overlay_on(cb) {
    // $('#overlay').css('display', 'block');
    document.getElementById("overlay").style.display = "block";
    // $('#overlay').trigger('resize');
}
  
function overlay_off(cb) {
    document.getElementById("overlay").style.display = "none";
}

reinit()