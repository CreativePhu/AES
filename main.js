'use strict'
import {createKeyRandom16, encode, decryption} from './aes.js'

const buttonCreateKey = document.querySelector('.btnCreateKey')
const buttonMaHoa = document.querySelector('.mahoa')
const buttonGiaiMa = document.querySelector('.giaima')
const inputText = document.querySelector('#text')
const inputTextOut = document.querySelector('#text1')
const inputKey = document.querySelector('#key')

function createKeyAuto(){
    buttonCreateKey.onclick = function(){
        let key = createKeyRandom16()
        inputKey.value = key
    }
}

function startEncode(){
    buttonMaHoa.onclick = function(){
        let valueskey = inputKey.value
        let valuesText = inputText.value
        let textOutValues = encode(valuesText, valueskey)
        inputTextOut.value = textOutValues
    }
}

function startDecryption(){
    buttonGiaiMa.onclick = function(){
        let valueskey = inputKey.value
        let valuesText = inputText.value
        let textAndKey = {
            text: valuesText,
            key: valueskey
        }
        let textOutValues = decryption(textAndKey)
        inputTextOut.value = textOutValues
    }
}




createKeyAuto()
startEncode()
startDecryption()
