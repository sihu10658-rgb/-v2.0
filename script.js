const display = document.getElementById('display');

// 버튼 누르면 화면에 숫자/기호 추가하는 함수
function appendValue(value) {
  if (display.value === '0') {
    display.value = value;
  } else {
    display.value += value;
  }
}

// C 버튼 누르면 초기화하는 함수
function clearDisplay() {
  display.value = '0';
}

// = 버튼 누르면 자바스크립트가 계산해주는 함수
function calculate() {
  try {
    // eval() 함수로 화면에 적힌 수식을 계산
    display.value = eval(display.value);
  } catch (error) {
    display.value = '에러';
  }
}
