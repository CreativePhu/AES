"use strict"

const SBox = [
    [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76],
    [0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0],
    [0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15],
    [0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75],
    [0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84],
    [0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf],
    [0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8],
    [0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2],
    [0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73],
    [0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb],
    [0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79],
    [0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08],
    [0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a],
    [0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e],
    [0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf],
    [0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16]
]

const fixedMatrix = [
    [0x02, 0x03, 0x01, 0x01],
    [0x01, 0x02, 0x03, 0x01],
    [0x01, 0x01, 0x02, 0x03],
    [0x03, 0x01, 0x01, 0x02]
];

// tạo khóa ngẫu nhiên
function createKeyRandom16(){
    // tạo mảng chỉ lưu trữ giá trị trong khoảng 16 bit
    let key = new Uint8Array(16);
    // tạo các giá trị ngẫu nhiên
    for(let i = 0; i < key.length; ++i){
        key[i] = Math.random() * 255
    }
    // chuyển các giá trị thành mã hex
    // trong trường hợp chuyển về hex chỉ có một giá trị thì sẽ slice -2 để đúng với quy tắc '00' là một phần của phần này
    let arrayHex = Array.from(key).map(function(e){
        return ('00' + e.toString(16)).slice(-2)
    })
    // chuyển tất cả thành phần trong mảng ra chuỗi
    let hexString = arrayHex.join('')
    return hexString;
}

// console.log(createKeyRandom16())


// chia đa data thành nhiều khối dữ liệu
function blockData(data){
    let blockSize=16
    // có thể chia thành mấy khối
    let blockCount = Math.ceil(data.length / blockSize)
    // tạo mảng có độ dài tương đương với số khối
    let blocks = new Array(blockCount)
    // gán mảng theo index mỗi lần là 16 kí tự của data
    for (let i = 0; i < blockCount; i++) {
        blocks[i] = data.substr(i * blockSize, blockSize)

        if(blocks[i].length < blockSize){
            // lấy số kí tự còn thiếu
            let paddingCount = blockSize - blocks[i].length
            // gán tất cả giá trị trong mảng thành 0
            let padding = new Array(paddingCount).fill(0).join('')
            // nối chuỗi block thiếu với chuỗi padding
            blocks[i] = blocks[i] + padding
        }else{
            blocks[i] = blocks[i]
        }
    }

    return blocks
}
// console.log(blockData('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'))


function convertStringToByte(arrayString){
    // khởi tạo hàm chuyển đổi string thành byte
    let encoder = new TextEncoder();
    // lặp qua mảng và chuyển đổi từng chuỗi trong mảng thành byte
    let byte = arrayString.map(function(element){
        return encoder.encode(element)
    })
    // trả về mảng đã chuyển đổi
    return byte
}

// console.log(convertStringToByte(blockData('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')))


function convertKeyHexToByte(hexKey){
    let key = []

    for(let i=0; i<hexKey.length; i+=2){
        // mỗi lần lấy 2 kí tự trong keyhex
        let hexByte = hexKey.substr(i,2)
        // chuyển hexByte thành byte 16
        let byte = parseInt(hexByte, 16)
        // add vào mảng 
        key.push(byte)
    }
    return key
}


// console.log(convertKeyHexToByte(createKeyRandom16()))


// xor hai mảng byte mot chieu
function xorByteArrays(A, B) {
    if (A.length !== B.length) {
      throw new Error('Arrays must have the same length')
    }
    let result = A.map((byte, i) => byte ^ B[i]) 
    return result
}


// xor các khối data với khóa gốc
function xorData(arrayDataByte, keyByte){
    let dataXor = []
    for(let i = 0; i<arrayDataByte.length;i++){
        let data = xorByteArrays(arrayDataByte[i], keyByte)
        dataXor.push(data)
    }
    return dataXor
}


// console.log(xorData(convertStringToByte(blockData('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')),convertKeyHexToByte(createKeyRandom16())))



// chuyển thành mã hex
function byteConvertHex(arrayData){
    let newArrayData = []
    arrayData.forEach(element => {
        let changeByte = (('00' + element.toString(16)).slice(-2))
        newArrayData.push(changeByte)
    });
    return newArrayData
}

// console.log(byteConvertHex([255, 255]))



// lọc qua sbox
function subBytes(arrayData){
    // chuyển thành dữ liệu hex
    let arrayDataHex = byteConvertHex(arrayData)
    // mảng chứa mã đã được lọc qua sbox
    let newArrayDataHex = []

    arrayDataHex.forEach(element => {
        let arrayElement = element.split('')
        let indexFirst;
        let indexLast;

        switch (arrayElement[0]) {
            case 'a':
                indexFirst = 10
                break;
            case 'b':
                indexFirst = 11
                break;
            case 'c':
                indexFirst = 12
                break;
            case 'd':
                indexFirst = 13
                break;
            case 'e':
                indexFirst = 14
                break;
            case 'f':
                indexFirst = 15
                break;
            default:
                indexFirst = arrayElement[0]
                break;
        }

        switch (arrayElement[1]) {
            case 'a':
                indexLast = 10
                break;
            case 'b':
                indexLast = 11
                break;
            case 'c':
                indexLast = 12
                break;
            case 'd':
                indexLast = 13
                break;
            case 'e':
                indexLast = 14
                break;
            case 'f':
                indexLast = 15
                break;
            default:
                indexLast = arrayElement[1]
                break;
        }

        newArrayDataHex.push(('00' + SBox[indexFirst][indexLast].toString(16)).slice(-2))
    });

    return newArrayDataHex
}


// console.log(subBytes(['19','a0','9a','e9','3d','f4','c6','f8','e3','e2','8d','48','be','2b','2a','08']))


// Chuyển ma trận 4x4
function convertMaTrix44(arrayData){
    let maxTrix44 = []
    let index = 0

    for(let i = 0; i < 4; i++){
        let cutArrayData = arrayData.slice(index,index+4)
        maxTrix44.push(cutArrayData)
        index+=4
    }

    return maxTrix44
}

// console.log(convertMaTrix44(subBytes(['19','a0','9a','e9','3d','f4','c6','f8','e3','e2','8d','48','be','2b','2a','08'])))



// bắt đầu thực hiện đổi chỗ các byte
function shiftRows(arrayData){
    let newArrayData = []
    newArrayData.push(arrayData[0])
    for(let i=1; i<arrayData.length; i++){
        let array1 = []
        let array2 = []
        array1 = arrayData[i].slice(0,i)
        array2 =arrayData[i].slice(i)
        newArrayData.push(array2.concat(array1))
    }
    return newArrayData
}

// console.log(shiftRows(convertMaTrix44(subBytes(['19','a0','9a','e9','3d','f4','c6','f8','e3','e2','8d','48','be','2b','2a','08']))))


// nhân 2 ma trận
function multiplyHexMatrix(mat1, mat2) {
    // Khởi tạo ma trận kết quả
    var result = new Array(mat1.length);
    for (var i = 0; i < mat1.length; i++) {
      result[i] = new Array(mat2[0].length);
    }
  
    // Thực hiện phép nhân ma trận
    for (var i = 0; i < mat1.length; i++) {
        for (var j = 0; j < mat2[0].length; j++) {
            result[i][j] = "00"; // Khởi tạo giá trị ban đầu của phần tử
            for (var k = 0; k < mat1[0].length; k++) {
                var product = multiplyHexNumbers(mat1[i][k], mat2[k][j]); // Tính tích của hai số thập lục phân
                result[i][j] = xorHexNumbers(result[i][j], product); // Thực hiện phép XOR giữa các tích để tính tổng cuối cùng
            }
        }
    }
  
    return result;
}


// nhân các số hex
function multiplyHexNumbers(a, b) {
    // Chuyển đổi các số thập lục phân sang nhị phân
    a = (('00' + a.toString(16)).slice(-2))
    b = (('00' + b.toString(16)).slice(-2))
  
    var binaryA = hexToBinary(a);
    var binaryB = hexToBinary(b);
    
      
    // Khởi tạo giá trị ban đầu của tích
    // Thực hiện phép nhân trong trường nhị phân GF(2^8)
    var product = "00000000";
    for (var i = 0; i < 8; i++) {
        if (binaryB.charAt(7 - i) == "1") {
            if(product.length === 2){
                product = hexToBinary(product)
                product = xorHexNumbers(product, binaryA.substr(i) + "0000000".substr(0, i));
            }else{
                product = xorHexNumbers(product, binaryA.substr(i) + "0000000".substr(0, i));
            }
        }
    }
  
    // Chuyển đổi kết quả từ nhị phân sang thập lục phân và trả về giá trị
    let abc = hexToBinary(product)
    return binaryToHex(abc);
}


// xor các số hex
function xorHexNumbers(a, b) {
    if(!(a.length == 2 && b.length == 2)){
        a = (('00' + parseInt(a,2).toString(16)).slice(-2))
        b = (('00' + parseInt(b,2).toString(16)).slice(-2))
    }
  
    //Chuyển đổi các số thập lục phân sang nhị phân
    var binaryA = hexToBinary(a);
    var binaryB = hexToBinary(b);
    
  
    // Thực hiện phép XOR giữa hai số nhị phân
    var result = "";
    for (var i = 0; i < 8; i++) {
        result += (binaryA.charAt(i) == binaryB.charAt(i)) ? "0" : "1";
    }
  
    // Chuyển đổi kết quả từ nhị phân sang thập lục phân và trả về giá trị
    return binaryToHex(result);
}


// chuyển từ hex ra nhị phân
function hexToBinary(hex) {
    var binary = "";
    for (var i = 0; i < hex.length; i++) {
        binary += ("0000" + parseInt(hex.charAt(i), 16).toString(2)).substr(-4);
    }
    return binary;
}


// chuyển từ nhị phân ra hex
function binaryToHex(binary) {
    var hex = "";
    for (var i = 0; i < 2; i++) {
        var slice = binary.substr(i * 4, 4);
        hex += parseInt(slice, 2).toString(16);
    }
    return hex;
}

// chuyển các phần từ trong ma trận từ thập lục phân về thập phân
function convertHexToDecimal(matrix) {
    const decimalMatrix = [];
    for (let i = 0; i < matrix.length; i++) {
        const row = [];
        for (let j = 0; j < matrix[i].length; j++) {
            const decimal = parseInt(matrix[i][j], 16);
            row.push(decimal);
        }
        decimalMatrix.push(row);
    }
    return decimalMatrix;
}

// xor hai mảng thập phân
function xorArrays(array1, array2) {
    const result = [];
    
    for (let i = 0; i < array1.length; i++) {
        const row = [];
        for (let j = 0; j < array1[i].length; j++) {
            row.push(array1[i][j] ^ array2[i][j]);
        }
        result.push(row);
    }
    
    return result;
}

// chuyển ma trận 4x4 thập phân thành thập lục phân
function decimalToHex(matrix) {
    const hexMatrix = [];
    for (let i = 0; i < matrix.length; i++) {
        const row = [];
        for (let j = 0; j < matrix[i].length; j++) {
            const hexValue = matrix[i][j].toString(16);
            row.push(hexValue.length === 1 ? '0' + hexValue : hexValue);
        }
        hexMatrix.push(row);
    }
    return hexMatrix;
}

// hàm chuyển ma trận 4x4 về mảng 1 chiều
function matrixToArray(matrix) {
    const array = [];
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            array.push(matrix[i][j]);
        }
    }
    return array;
}


// chuyển mảng thường về mảng Uint8Array()
function convertArrayToUint8Array(array) {
    let uint8Array = [];
  
    for (let i = 0; i < array.length; i++) {
        let row = new Uint8Array(array[i].length);
        for (let j = 0; j < array[i].length; j++) {
            row.set([array[i][j]], j);
        }
        uint8Array.push(row);
    }
  
    return uint8Array;
}
  

// chuyển đổi byte về chuỗi text đọc
function convertByteToString(arrayByte){
    // khởi tạo hàm chuyển đổi byte thành string
    let decoder = new TextDecoder();
    // lặp qua mảng và chuyển đổi từng byte trong mảng thành string
    let string = arrayByte.map(function(element){
        return decoder.decode(element);
    })
    // trả về mảng đã chuyển đổi
    return string;
}  

  
function encode(text){

    const listKey = []

    // tạo 11 khóa lưu vào mảng
    for(let i = 0; i < 11; i++){
        listKey.push(createKeyRandom16())
    }
    
    // chia text thành các khối dữ liệu
    let step1 = blockData(text)
    // console.log(step1)

    // chuyển các phần tử trong step 1 thành byte
    let step2 = convertStringToByte(step1)
    // console.log(step2)

    //chuyển key gốc thành mảng chứa các giá trị byte
    let step3 = convertKeyHexToByte(listKey[0])
    // console.log(step3)


    // xor data với khóa đầu tiền ở dạng byte
    let step4 = xorData(step2,step3)
    // console.log(step4)


    // chuyển từng khối dữ liệu sang mã hex
    let listConvertToHexArrayData = []
    for (let i=0; i<step4.length; i++){
        listConvertToHexArrayData.push(byteConvertHex(step4[i]))
    }
    // console.log(listConvertToHexArrayData)

    

    function setUp9(DataNeedChange){

        let listConvertToHexArrayData = DataNeedChange;

        for(let i=1; i<10; i++){

            // xor từng khối dữ liệu lọc qua sbox
            let listXorSbox = []
            for (let a=0; a<listConvertToHexArrayData.length; a++){
                listXorSbox.push(subBytes(listConvertToHexArrayData[a]))
            }
            // console.log(listXorSbox)

            // chuyyển từng khối data thành ma trận 4x4
            let listConvertMaxTrix44 = []
            for (let b=0; b<listXorSbox.length; b++){
                listConvertMaxTrix44.push(convertMaTrix44(listXorSbox[b]))
            }
            // console.log(listConvertMaxTrix44)


            // đổi chỗ các byte trong khối dữ liệu
            let listArrayShiftRows = []
            for (let c=0; c<listConvertMaxTrix44.length; c++){
                listArrayShiftRows.push(shiftRows(listConvertMaxTrix44[c]))
            }
            // console.log(listArrayShiftRows)

            // multiply Matrix GF28
            let multiplyGF28 = []
            for (let d=0; d<listArrayShiftRows.length; d++){
                multiplyGF28.push(multiplyHexMatrix(fixedMatrix,listArrayShiftRows[d]))
            }
            // console.log(multiplyGF28)


            // chuyển key và data về thập phân và đưa về ma trận 4x4
            let key = convertMaTrix44(convertKeyHexToByte(listKey[i]))
            // console.log(key)
            let data = []
            for (let e=0; e<multiplyGF28.length; e++){
                data.push(convertHexToDecimal(multiplyGF28[e]))
            }

            // xor key with data
            let listMaxTrixXorKey = []
            for (let f=0; f<data.length; f++){
                listMaxTrixXorKey.push(xorArrays(data[f],key))
            }
            // console.log(listMaxTrixXorKey)

            let newArrayData = []
            for (let g=0; g<listMaxTrixXorKey.length; g++){
                newArrayData.push(matrixToArray(decimalToHex(listMaxTrixXorKey[g])))
            }

            listConvertToHexArrayData = newArrayData

            // console.log(listConvertToHexArrayData)

        }

        return listConvertToHexArrayData
    }

    let finishRepeat = setUp9(listConvertToHexArrayData)

    // xor từng khối dữ liệu lọc qua sbox
    let listXorSbox = []
    for (let a=0; a<finishRepeat.length; a++){
        listXorSbox.push(subBytes(finishRepeat[a]))
    }
    // console.log(listXorSbox)

    // chuyyển từng khối data thành ma trận 4x4
    let listConvertMaxTrix44 = []
    for (let b=0; b<listXorSbox.length; b++){
        listConvertMaxTrix44.push(convertMaTrix44(listXorSbox[b]))
    }
    // console.log(listConvertMaxTrix44)


    // đổi chỗ các byte trong khối dữ liệu
    let listArrayShiftRows = []
    for (let c=0; c<listConvertMaxTrix44.length; c++){
        listArrayShiftRows.push(shiftRows(listConvertMaxTrix44[c]))
    }
    // console.log(listArrayShiftRows)

    // chuyển key và data về thập phân và đưa về ma trận 4x4
    let key = convertMaTrix44(convertKeyHexToByte(listKey[10]))
    // console.log(key)
    let data = []
    for (let e=0; e<listArrayShiftRows.length; e++){
        data.push(convertHexToDecimal(listArrayShiftRows[e]))
    }

    // xor key with data
    let listMaxTrixXorKey = []
    for (let f=0; f<data.length; f++){
        listMaxTrixXorKey.push(xorArrays(data[f],key))
    }
    // console.log(listMaxTrixXorKey)

    let newArrayData = []
    for (let g=0; g<listMaxTrixXorKey.length; g++){
        newArrayData.push(matrixToArray(listMaxTrixXorKey[g]))
    }

    let textEnCode = convertByteToString(convertArrayToUint8Array(newArrayData)).join('')

    console.log(textEnCode)

}

encode('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
