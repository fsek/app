/*
 * Use this instead of any built in touch/press events if
 * you want a button that doesn't take focus when pressed.
 * Very useful if you want the keyboard to stay up when
 * the button is pressed (default behavior: keyboard goes down)
 */
function nonFocusingButton(button, onPress) {
  const element = button[0];

  element.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
  });

  element.addEventListener('mousedown', function(event) {
    event.preventDefault();
    event.stopPropagation();
  });

  element.addEventListener('touchdown', function(event) {
    event.preventDefault();
    event.stopPropagation();
  });

  element.addEventListener('touchmove', function(event) {
    event.preventDefault();
    event.stopPropagation();
  });

  element.addEventListener('touchstart', function(event) {
    event.preventDefault();
    event.stopPropagation();

    button.addClass('active-state');
  });
  element.addEventListener('touchend', function(event) {
    //Triggered by a phone
    event.preventDefault();
    event.stopPropagation();

    button.removeClass('active-state');
    onPress();
  });
  element.addEventListener('mouseup', function() {
    //Triggered by a browser
    onPress();
  });
}
