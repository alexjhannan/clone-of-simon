(function(){

	// sounds are preloaded and defined up here
	var sound1 = new Howl({ urls: ['https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'] });
	var sound2 = new Howl({ urls: ['https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'] });
	var sound3 = new Howl({ urls: ['https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'] });
	var sound4 = new Howl({ urls: ['https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'] });
	var failSound = new Howl({ urls: ['/sounds/fail-sound.wav'] });

	var simon = {
		sequence: [],
		mode: 'normal',
		addStep: function(){
			// 1 - create a random # 1 - 4
			// 2 - push number to sequence
			var random = Math.round(Math.random()*3)+1;

			this.sequence.push(random);
		},
		animate: function(){
			// 0 - disable input
			// 1 - animate sequence (reset count, increment on step, reset count)
			// 2 - invoke playerTurn
			var i = 0;

			simon.disableInput();

			// wrapped in a timeout for better UX
			setTimeout(function(){
				simon.resetCount();

				simon.lightUp(simon.sequence[i]);

				i+=1;

				simon.incrementCount();

				var interval = setInterval(function(){
					// stop interval when sequence is complete
					if (i === simon.sequence.length) {
						simon.resetCount();

						clearInterval(interval);

						return simon.playerTurn();
					}

					// loops across current element in simon.sequence, 1s delay between
					simon.lightUp(simon.sequence[i]);

					i+=1;

					simon.incrementCount();

				}, 1000);
			}, 1000);
		},
		enableMenu: function(){
			// enables mode, start, and reset buttons
			$('[data-btn]').each(function(){
				if ($(this).data('btn') === 'mode'){
						
					$(this).click(simon.toggleMode);

				} else if ($(this).data('btn') === 'start'){

					$(this).click(simon.start);
	
				} else if ($(this).data('btn') === 'reset'){

					$(this).click(simon.reset);

				}

			});
		},
		getCount: function(){
			// retrieve the value of the counter
			return $('[data-id=counter]').text();
		},
		incrementCount: function(){
			// increment counter, and return updated value

			var $counter = $('[data-id=counter]');

			$counter.text(parseInt($counter.text()) +1 );

			return simon.getCount();
		},
		lightUp: function(btn, timer){
			// 1 - add a 'lit' class to btn
			// 1.5 - trigger relevant sound
			// 2 - wait 350ms, then remove 'lit' class from same btn
			var $btn = $('[data-btn=' + btn + ']');
			$btn.addClass('lit');

			simon.playSound(btn);

			var timeout = setTimeout(function(){
				$btn.removeClass('lit');
			}, timer || 500);
		},
		lightUpAll: function(timer){
			// invokes lightUp on every btn in sequence
			var i = 1, interval = setInterval(function(){
				if (i === 5){
					clearInterval(interval);
					return;
				}

				simon.lightUp(i, timer || 150);

				i+=1;
			}, timer * 2 || 300);
		},
		playerTurn: function(){
			// 1 - use current counter to determine correct answer
			// 2 - set correct inputs to yay, incorrect to nay
			// yay -> light up tile, play sound, increment counter, and either invoke playerTurn OR addStep & animate (check this.sequence.length vs this.counter)
			// nay -> play fail sound, and either invoke animate or reset (check this.mode)
			// note - handler for reset button, mode should only be accessible during playerTurn BEFORE making a choice (any time we're not animating)
			// 3 - CLEAR ALL HANDLERS (correct, incorrect x3, reset, and mode) on CORRECT, INCORRECT, or RESET

			var count = simon.getCount(), answer = simon.sequence[count];

			simon.enableMenu();

			assignAnswers();

			function assignAnswers(){
				// helper funciton, sets event handlers for tiles by checking data-btn value
				// correct answer can be checked against, and inputs can be added to all buttons
				// inputs are then removed when an action button (answer, reset, or start) is pressed

				var $buttons = $('[data-btn]');

				$buttons.each(function(){
					 if ($(this).data('btn') === answer){

						$(this).click(correctAnswer);

					} else if (typeof $(this).data('btn') === 'number'){

						$(this).click(incorrectAnswer);

					}
				});

				function correctAnswer(){
					// disable input, increment count, and exit via victory, playerTurn, or start
					simon.disableInput();

					simon.lightUp(answer, 50);

					var count = simon.incrementCount();

					if (count === simon.sequence.length+''){
						return count === 5+'' ? simon.victory() : simon.start();
					} else {
						return simon.playerTurn();
					}
				}

				function incorrectAnswer(){
					// disable input, play fail sound. then, if strict mode, reset; else, animate
					simon.disableInput();

					failSound.play();

					setTimeout(function(){
						if (simon.mode === 'strict'){
							return simon.reset();
						} else{
							return simon.animate();
						}
					}, 500);
				}
			}
		},
		playSound: function(btn){
			// plays correct sound for each button
			if (btn === 1) { sound1.play() }
			else if (btn === 2) { sound2.play() }
			else if (btn === 3) { sound3.play() }
			else if (btn === 4) { sound4.play() }
		},
		toggleMode: function(){
			// switch from normal to strict to normal
			if (simon.mode === 'normal'){

				simon.mode = 'strict';

				$("[data-btn=mode]").html('Strict');

				$('#strict-warning').show('fast');

			} else if (simon.mode === 'strict'){

				simon.mode = 'normal';

				$("[data-btn=mode]").html('Normal');

				$('#strict-warning').hide('fast');

			}
		},
		reset: function(){
			// 0 - disable input
			// 1 - reset counter, reset seqeunce
			// 2 - reset animation w/ lightUpAll
			var i = 0;

			simon.disableInput();

			simon.sequence = [];

			simon.resetCount();

			simon.lightUpAll();

			var interval = setInterval(function(){
				if (i === 0) {
					clearInterval(interval);
					
					setTimeout(function(){
						simon.lightUp(4);
						setTimeout(function(){
							simon.lightUp(3);
							setTimeout(function(){
								simon.lightUp(2);
								setTimeout(function(){
									simon.lightUp(1);
								}, 100);
							}, 170);
						}, 150);
					}, 150);

					return simon.waiting();
				}

				simon.lightUpAll();

				i+=1;
			}, 1200);

		},
		resetCount: function(){
			return $('[data-id=counter]').text(0);
		},
		start: function(){
			// 1 - invoke addStep
			// 2 - invoke animate
			// call upon starting a new game or upon finishing a sequence round
			simon.addStep();
			simon.animate();
		},
		victory: function(){
			// 1 - play victory sound
			// 2 - invoke reset
			simon.reset();
		},
		waiting: function(){
			// really just an alias for enabling the menu, but far more expressive
			simon.enableMenu();
		},
		disableInput: function(){
			// removes event handlers from all buttons, disabling input
			var $buttons = $('[data-btn]');

			$buttons.each(function(){
				$(this).off();
			});
		}
	}

	$(document).ready(function(){
		simon.waiting();
	})
}());