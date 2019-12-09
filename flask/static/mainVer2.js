var state = [];
var rotateIdxs_old = null;
var rotateIdxs_new = null;
var stateToFE = null;
var FEToState = null;
var legalMoves = null;
var cubeMoves = ["u","U","d","D","l","L","r","R","b","B","f","F"];
var cubeMovesMap = {"U_-1": "u", "U_1": "U", "D_-1": "d", "D_1": "D", "L_-1": "l", "L_1": "L", "R_-1":"r", "R_1":"R", "B_-1":"b", "B_1":"B", "F_-1":"f", "F_1":"F"};

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
		doTwistByMove(moves,500);
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
		disableInput();
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
		newState = reOrderArray(newState_rep,stateToFE);
		state = newState;

		//Call again if there are more moves
		if (moves.length > 0) {
			setTimeout(function(){nextState(moveTimeout)}, moveTimeout);
		} else {
			enableInput();
			if (solveMoves.length > 0) {
				enableScroll();
				setSolnText();
			}
		}
	} else {
		enableInput();
		if (solveMoves.length > 0) {
			enableScroll();
			setSolnText();
		}
	}
}

function nextStateWithTwist(moveTimeout=0) {
	if (moves.length > 0) {
		disableInput();
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
		state = newState
		doTwistByInput(cubeMovesMap[move], 0.8 * moveTimeout)

		//Call again if there are more moves
		if (moves.length > 0) {
			setTimeout(function(){nextState(moveTimeout)}, moveTimeout);
		} else {
			enableInput();
			if (solveMoves.length > 0) {
				enableScroll();
				setSolnText();
			}
		}
	} else {
		enableInput();
		if (solveMoves.length > 0) {
			enableScroll();
			setSolnText();
		}
	}
}

function scrambleCubeByButton() {
	disableInput();
	clearSoln();
	var WCA_SCRAMBLE_SHORT = '';
	numMoves = randInt(50,80);
	for (var i = 0; i < numMoves; i++) {
		var temp = randInt(0,legalMoves.length);
		moves.push(legalMoves[temp]);
	}
	doTwistByMove(moves,0);
	nextState(0);
	// alert(state);
}

function solveCube() {
	disableInput();
	clearSoln();
	// alert(state);
	document.getElementById("solution_text").innerHTML = "SOLVING..."
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
			doTwistByMove(moves, 500);
			setTimeout(function(){nextState(500)}, 500);
		},
		error: function(error) {
				console.log(error);
				document.getElementById("solution_text").innerHTML = "..."
				setTimeout(function(){solveCube()}, 500);
		},
	});
}

function doTwistByInput(WCA_SCRAMBLE_SHORT, twistTime){
	cube.twistDuration = twistTime;
	// var WCA_SCRAMBLE_SHORT = 'uRlfRLUu';
	cube.twistCountDown =
	WCA_SCRAMBLE_SHORT.length + cube.twistQueue.history.length;  
	cube.twist(WCA_SCRAMBLE_SHORT);
	scopedCheckQueue = checkQueue.bind(this, startInteractiveCube);
	cube.addEventListener('onTwistComplete', scopedCheckQueue);
}

function doTwistByMove(moveList, twistTime){
	// alert(moveList);
	var twistSeq = '';
	for(var i = 0; i < moveList.length; i++) {
		var curMove = moveList[i]
		twistSeq = twistSeq + cubeMovesMap[curMove];
	}
	// alert(twistSeq);
	cube.twistDuration = twistTime;
	cube.twistCountDown = twistSeq.length + cube.twistQueue.history.length;  
	cube.twist(twistSeq);
	scopedCheckQueue = checkQueue.bind(this, startInteractiveCube);
	cube.addEventListener('onTwistComplete', scopedCheckQueue);
	
}

$( document ).ready($(function() {
	disableInput();
	clearSoln();
	$.ajax({
		url: '/initState',
		data: {},
		type: 'POST',
		dataType: 'json',
		success: function(response) {
			// alert("1");
			state = response["state"];
			rotateIdxs_old = response["rotateIdxs_old"];
			rotateIdxs_new = response["rotateIdxs_new"];
			stateToFE = response["stateToFE"];
			FEToState = response["FEToState"];
			legalMoves = response["legalMoves"]
			enableInput();
		},
		error: function(error) {
			console.log(error);
		},
	});
	// enableInput();
	$("#cube").css("transform", "translateZ( -100px) rotateX( " + rotX + "deg) rotateY(" + rotY + "deg)"); //Initial orientation	

	$('#scramble').click(function() {
		scrambleCubeByButton();
	});

	$('#solve').click(function() {
		solveCube()
	});

	$('#first_state').click(function() {
		if (solveIdx > 0) {
			moves = solveMoves_rev.slice(0, solveIdx).reverse();
			solveIdx = 0;
			doTwistByMove(moves, 5);
			nextState(10);
		}
	});

	$('#prev_state').click(function() {
		if (solveIdx > 0) {
			solveIdx = solveIdx - 1;
			moves.push(solveMoves_rev[solveIdx]);
			doTwistByMove(moves, 500);
			nextState(500);
		}
	});

	$('#next_state').click(function() {
		if (solveIdx < solveMoves.length) {
			moves.push(solveMoves[solveIdx]);
			solveIdx = solveIdx + 1;
			doTwistByMove(moves, 500);
			nextState(500);
		}
	});

	$('#last_state').click(function() {
		if (solveIdx < solveMoves.length) {
			moves = solveMoves.slice(solveIdx, solveMoves.length);
			solveIdx = solveMoves.length
			doTwistByMove(moves, 5);
			nextState(10);
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
	// alert("1");
	// var WCA_SCRAMBLE_SHORT = 'urlfFLRU';
	// doTwistByInput(WCA_SCRAMBLE_SHORT, 0);
	// setTimeout(doTwistByInput(WCA_SCRAMBLE_SHORT, 0),20000);
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
