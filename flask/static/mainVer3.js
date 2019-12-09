var state = [];
var rotateIdxs_old = null;
var rotateIdxs_new = null;
var stateToFE = null;
var FEToState = null;
var legalMoves = null;

var solveStartState = [];
var solveMoves = [];
var solveMoves_rev = [];
var solveIdx = null;
var solution_text = null;

var faceNames = ["top", "bottom", "left", "right", "back", "front"];
var colorMap = {0: "#ffffff", 1: "#ffff1a", 4: "#0000ff", 5: "#33cc33", 2: "#ff8000",3: "#e60000"};
var lastMouseX = 0,
  lastMouseY = 0;
var rotX = -30,
  rotY = -30;

var moves = []

function reOrderArray(arr,indecies) {
	var temp = []
	for(var i = 0; i < indecies.length; i++) {
		var index = indecies[i]
		temp.push(arr[index])
	}

	return temp;
}

/*
	Rand int between min (inclusive) and max (exclusive)
*/
function randInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function clearCube() {
  for (i = 0; i < faceNames.length; i++) {
    var myNode = document.getElementById(faceNames[i]);
    while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
    }
  }
}

function setStickerColors(newState) {
	state = newState
  clearCube()

  idx = 0
  for (i = 0; i < faceNames.length; i++) {
    for (j = 0; j < 9; j++) {
      var iDiv = document.createElement('div');
      iDiv.className = 'sticker';
      iDiv.style["background-color"] = colorMap[Math.floor(newState[idx]/9)]
      document.getElementById(faceNames[i]).appendChild(iDiv);
      idx = idx + 1
    }
  }
}

function buttonPressed(ev) {
	var face = ''
	var direction = '1'

	if (ev.shiftKey) {
		direction = '-1'
	}
	if (ev.which == 85 || ev.which == 117) {
		face='U'
	} else if (ev.which == 68 || ev.which == 100) {
		face = 'D'
	} else if (ev.which == 76 || ev.which == 108) {
		face = 'L'
	} else if (ev.which == 82 || ev.which == 114) {
		face = 'R'
	} else if (ev.which == 66 || ev.which == 98) {
		face = 'B'
	} else if (ev.which == 70 || ev.which == 102) {
		face = 'F'
	}
	if (face != '') {
		clearSoln();
		moves.push(face + "_" + direction);
		nextState();
	}
}


function enableScroll() {
	document.getElementById("first_state").disabled=false;
	document.getElementById("prev_state").disabled=false;
	document.getElementById("next_state").disabled=false;
	document.getElementById("last_state").disabled=false;
}

function disableScroll() {
	document.getElementById("first_state").blur(); //so keyboard input can work without having to click away from disabled button
	document.getElementById("prev_state").blur();
	document.getElementById("next_state").blur();
	document.getElementById("last_state").blur();

	document.getElementById("first_state").disabled=true;
	document.getElementById("prev_state").disabled=true;
	document.getElementById("next_state").disabled=true;
	document.getElementById("last_state").disabled=true;
}

/*
	Clears solution as well as disables scroll
*/
function clearSoln() {
	solveIdx = 0;
	solveStartState = [];
	solveMoves = [];
	solveMoves_rev = [];
	solution_text = null;
	document.getElementById("solution_text").innerHTML = "Solution:";
	disableScroll();
}

function setSolnText(setColor=true) {
	solution_text_mod = JSON.parse(JSON.stringify(solution_text))
	if (solveIdx >= 0) {
		if (setColor == true) {
			solution_text_mod[solveIdx] = solution_text_mod[solveIdx].bold().fontcolor("blue")
		} else {
			solution_text_mod[solveIdx] = solution_text_mod[solveIdx]
		}
	}
	document.getElementById("solution_text").innerHTML = "Solution: "+ solution_text_mod.join(" ");
}

function enableInput() {
	document.getElementById("scramble").disabled=false;
	document.getElementById("solve").disabled=false;
	$(document).on("keypress", buttonPressed);
}

function disableInput() {
	document.getElementById("scramble").disabled=true;
	document.getElementById("solve").disabled=true;
	$(document).off("keypress", buttonPressed);
}

function nextState(moveTimeout=0) {
	if (moves.length > 0) {
		// disableInput();
		disableScroll();
		move = moves.shift() // get Move
		
		//convert to python representation
		state_rep = reOrderArray(state,FEToState)
		newState_rep = JSON.parse(JSON.stringify(state_rep))

		//swap stickers
		for (var i = 0; i < rotateIdxs_new[move].length; i++) {
			newState_rep[rotateIdxs_new[move][i]] = state_rep[rotateIdxs_old[move][i]]
		}

		// Change move highlight
		if (moveTimeout != 0){ //check if nextState is used for first_state click, prev_state,etc.
				solveIdx++
				setSolnText(setColor=true)
		}

		//convert back to HTML representation
		newState = reOrderArray(newState_rep,stateToFE)

		//set new state
		setStickerColors(newState)

		//Call again if there are more moves
		if (moves.length > 0) {
			setTimeout(function(){nextState(moveTimeout)}, moveTimeout);
		} else {
			// enableInput();
			if (solveMoves.length > 0) {
				enableScroll();
				setSolnText();
			}
		}
	} else {
		// enableInput();
		if (solveMoves.length > 0) {
			enableScroll();
			setSolnText();
		}
	}
}

function scrambleCube() {
	// disableInput();
	clearSoln();

	numMoves = randInt(100,200);
	for (var i = 0; i < numMoves; i++) {
		moves.push(legalMoves[randInt(0,legalMoves.length)]);
	}

	nextState(0);
}

function solveCube() {
	// disableInput();
	clearSoln();
	document.getElementById("solution_text").innerHTML = "SOLVING..."
	alert(JSON.stringify(state));
	$.ajax({
		url: '/solve',
		data: {"state": JSON.stringify(state)},
		type: 'POST',
		dataType: 'json',
		success: function(response) {
			solveStartState = JSON.parse(JSON.stringify(state))
			solveMoves = response["moves"];
			solveMoves_rev = response["moves_rev"];
			solution_text = response["solve_text"];
			solution_text.push("SOLVED!")
			setSolnText(true);

			moves = JSON.parse(JSON.stringify(solveMoves))

			setTimeout(function(){nextState(500)}, 500);
		},
		error: function(error) {
				console.log(error);
				document.getElementById("solution_text").innerHTML = "..."
				setTimeout(function(){solveCube()}, 500);
		},
	});
}

function solveCubeByInput() {
	// disableInput();
	clearSoln();
	// alert(1);
	document.getElementById("solution_text").innerHTML = "SOLVING..."
	// alert(JSON.stringify(state));
	$.ajax({
		url: '/solvebyinput',
		data: {"state": JSON.stringify(state)},
		type: 'POST',
		dataType: 'json',
		success: function(response) {
			// alert("solve");
			state = response["state"];
			solveStartState = JSON.parse(JSON.stringify(state))
			solveMoves = response["moves"];
			solveMoves_rev = response["moves_rev"];
			solution_text = response["solve_text"];
			solution_text.push("SOLVED!")
			setSolnText(true);

			moves = JSON.parse(JSON.stringify(solveMoves))

			setTimeout(function(){nextState(500)}, 500);
		},
		error: function(error) {
				console.log(error);
				document.getElementById("solution_text").innerHTML = "..."
				setTimeout(function(){solveCube()}, 500);
		},
	});
}

$( document ).ready($(function() {
	// disableInput();
	clearSoln();
	state = [2, 5, 8, 1, 4, 7, 0, 3, 6, 11, 14, 17, 10, 13, 16, 9, 12, 15, 20, 23, 26, 19, 22, 25, 18, 21, 24, 29, 32, 35,
         28, 31, 34, 27, 30, 33, 42, 39, 36, 43, 40, 37, 44, 41, 38, 47, 50, 53, 46, 49, 52, 45, 48, 51];
	setStickerColors(state);
	$.ajax({
		url: '/initState',
		data: {},
		type: 'POST',
		dataType: 'json',
		success: function(response) {
			setStickerColors(response["state"]);
			rotateIdxs_old = response["rotateIdxs_old"];
			rotateIdxs_new = response["rotateIdxs_new"];
			stateToFE = response["stateToFE"];
			FEToState = response["FEToState"];
			legalMoves = response["legalMoves"]
			// enableInput();
		},
		error: function(error) {
			console.log(error);
		},
	});

	$("#cube").css("transform", "translateZ( -100px) rotateX( " + rotX + "deg) rotateY(" + rotY + "deg)"); //Initial orientation	

	$('#scramble').click(function() {
		scrambleCube()
	});

	$('#solve').click(function() {
		solveCube()
	});
	$('#newSolve').click(function() {
		solveCubeByInput()
	});
	$('#first_state').click(function() {
		if (solveIdx > 0) {
			moves = solveMoves_rev.slice(0, solveIdx).reverse();
			solveIdx = 0;
			nextState();
		}
	});

	$('#prev_state').click(function() {
		if (solveIdx > 0) {
			solveIdx = solveIdx - 1
			moves.push(solveMoves_rev[solveIdx])
			nextState()
		}
	});

	$('#next_state').click(function() {
		if (solveIdx < solveMoves.length) {
			moves.push(solveMoves[solveIdx])
			solveIdx = solveIdx + 1
			nextState()
		}
	});

	$('#last_state').click(function() {
		if (solveIdx < solveMoves.length) {
			moves = solveMoves.slice(solveIdx, solveMoves.length);
			solveIdx = solveMoves.length
			nextState();
		}
	});

	$('#cube_div').on("mousedown", function(ev) {
		lastMouseX = ev.clientX;
		lastMouseY = ev.clientY;
		$('#cube_div').on("mousemove", mouseMoved);
	});
	$('#cube_div').on("mouseup", function() {
		$('#cube_div').off("mousemove", mouseMoved);
	});
	$('#cube_div').on("mouseleave", function() {
		$('#cube_div').off("mousemove", mouseMoved);
	});

	console.log( "ready!" );
}));


function mouseMoved(ev) {
  var deltaX = ev.pageX - lastMouseX;
  var deltaY = ev.pageY - lastMouseY;

  lastMouseX = ev.pageX;
  lastMouseY = ev.pageY;

  rotY += deltaX * 0.2;
  rotX -= deltaY * 0.5;

  $("#cube").css("transform", "translateZ( -100px) rotateX( " + rotX + "deg) rotateY(" + rotY + "deg)");
}



var colors=[0,0,0,0,0,0];
var data=["red","yellow","orange","green","white","blue"];
var colorWordToIdx = {"white": 0, "yellow": 1, "orange": 2, "red": 3, "blue": 4, "green": 5};
var buttonColor=""

function colorSelect(ele){
	buttonColor=ele.id;
	// console.log(buttonColor)
	colors=[0,0,0,0,0,0];
	switch(buttonColor){
		case "redButton":
			colors[0]=1; 
			break;
		case "yellowButton": 
			colors[1]=1;
			break;
		case "orangeButton": 
			colors[2]=1;
			break;
		case "greenButton": 
			colors[3]=1;
			break;
		case "whiteButton": 
			colors[4]=1;
			break;
		case "blueButton": 
			colors[5]=1;
			break;
		case "cancelButton":
			colors=[0,0,0,0,0,0];
			break;
	}
	console.log(colors);
	var indexSet=-1;
	indexSet=colors.indexOf(1);
	if (indexSet >=0 ){
		$("#colorNow").text(data[indexSet])
	}
	else{$("#colorNow").text("未设定")}
}

function colorSet(ele){
	var strId = ele.id;
	var tempStickerIdxArr = strId.split('_');
	var tempIdx = parseInt(tempStickerIdxArr[1]);
	// alert(tempIdx);
	var indexSet=-1;
	indexSet=colors.indexOf(1);
	if (indexSet >=0 ){
		var colorValue=data[indexSet];
		var colorIdx = colorWordToIdx[colorValue];
		console.log(colorValue);
		console.log(ele.style.backgroundColor);
		ele.style.backgroundColor=colorValue;
		console.log(ele.style.backgroundColor);
		state[tempIdx] = 9 * colorIdx;
		setStickerColors(state);
	}
}

