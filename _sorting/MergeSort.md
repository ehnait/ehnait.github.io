---
title: '归并排序'
excerpt : ""
---
```java
public class MergeSort {
    public static int[] sortArray(int[] nums) {
        if (nums.length < 2) return nums;
        int mid = nums.length / 2;
        int[] left = Arrays.copyOfRange(nums, 0, mid);
        int[] right = Arrays.copyOfRange(nums, mid, nums.length);
        return merger(sortArray(left), sortArray(right));
    }

    private static int[] merger(int[] left, int[] right) {
        int[] result = new int[left.length + right.length];
        int indexLeft = 0, indexRight = 0;
        for (int i = 0; i < result.length; i++) {
            if (indexLeft >= left.length) { /*左边数组已经取完了，直接取右边即可*/
                result[i] = right[indexRight++];
            } else if (indexRight >= right.length) { /*右边数组已经取完了，直接取左边即可*/
                result[i] = left[indexLeft++];
            } else if (left[indexLeft] > right[indexRight]) { /*左边数组的元素值大于右边数组的值，取右边*/
                result[i] = right[indexRight++];
            } else {/*右边数组的元素值大于左边数组的值，取左边*/
                result[i] = left[indexLeft++];
            }
        }
        System.out.println("左子数组: " + Arrays.toString(left));
        System.out.println("右子数组: " + Arrays.toString(right));
        System.out.println("合并后数组: " + Arrays.toString(result));
        System.out.println("--------------------------------");
        return result;
    }
}

```
