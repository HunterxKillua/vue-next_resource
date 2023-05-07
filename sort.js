const quickSort = (arr) => {
  if (arr.length <= 1) return arr
  const pivotIndex = Math.floor(arr.length / 2) ;
  const pivot = arr.splice(pivotIndex, 1)[0];
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length; i++){
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  return quickSort(left).concat([pivot], quickSort(right))
}

const a = [189, 105, 789, 98, 63, 34, 0, 34, 25, 24];


// 归并

const MergeArr = (list) => {
  for(let i = 0; i < list.length; i++) {
    if (Array.isArray(list[i])) {
      const result = getMin(list[i], list[i + 1])
      console.log(result)
    }
  }
}
function mergeSort(arr) {
  if (arr.length === 1) return arr;
  const midIdx = Math.floor(arr.length / 2);
  const res = merge(mergeSort(arr.slice(0, midIdx)), mergeSort(arr.slice(midIdx)));
  console.log('****');
  console.log(res);
  console.log('****');
  return res
}

function merge(leftArr, rightArr) {
  let temp = [];
  console.log(leftArr, rightArr);
  while (leftArr.length > 0 && rightArr.length > 0) {
      if (leftArr[0] < rightArr[0]) {
          temp.push(leftArr.shift());
      } else {
          temp.push(rightArr.shift());
      }
  }
  console.log(temp);
  return temp.concat(leftArr).concat(rightArr);
}

console.log(mergeSort(a))

const bubble = () => {
  for(let i = 0; i < a.length; i++) {
    for(let j = 0; j < a.length - i; j++) {
      if (a[j] > a[j + 1]) {
        const min = a[j + 1]
        const max = a[j]
        a[j] = min
        a[j + 1] = max
      }
    }
  }
}
