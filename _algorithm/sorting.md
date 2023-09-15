---
title: '十大排序'
layout: single
author_profile: true
toc: true
toc_sticky: true
---

Top 10 Sorting Algorithms.

## 冒泡排序（Bubble Sort）

通过相邻元素的比较和交换来进行排序。

```java
 public class BubbleSort {
    public static int[] sortArray(int[] nums) {
        if (nums.length == 0) return nums;
        for (int i = 0; i < nums.length; i++) {
            // [nums.length - 1 - i ]  最后一个数据已经排序完了
            for (int j = 0; j < nums.length - 1 - i; j++) {
                if (nums[j] > nums[j + 1]) {
                    int temp = nums[j + 1];
                    nums[j + 1] = nums[j];
                    nums[j] = temp;
                }
                System.out.println(Arrays.toString(nums));
            }
            System.out.println("----------------------------------");
        }
        return nums;
    }
}
```

## 选择排序（Selection Sort）

每次从未排序的部分中选择最小（或最大）的元素放到已排序部分的末尾。

```java
  public class ChooseSort {
    public static int[] sortArray(int[] nums) {
        if (nums.length == 0) return nums;
        for (int i = 0; i < nums.length; i++) {
            int minIndex = i;//最小值下标
            for (int j = i; j < nums.length; j++) {
                if (nums[j] < nums[minIndex]) {
                    minIndex = j;
                }
            }

            System.out.println("最小数为:" + nums[minIndex]);

            int temp = nums[i];
            nums[i] = nums[minIndex];
            nums[minIndex] = temp;
            System.out.println(Arrays.toString(nums));
            System.out.println("---------------------------");
        }
        return nums;
    }
}
```

## 插入排序（Insertion Sort）

将元素逐个插入到已排序的部分中的正确位置。

```java
   public class InsertSort {
    public static int[] sortArray(int[] nums) {
        if (nums.length == 0) return nums;
        int currentValue;
        for (int i = 0; i < nums.length - 1; i++) {
            int preIndex = i;
            currentValue = nums[preIndex + 1];
            System.out.println("待排序元素索引:" + (i + 1) + " 值为:" + currentValue + ",已经被排序数组的索引: " + preIndex);
            /*在已被排序过的数据中倒序寻找合适的位置,如果当前待排序数据比比较的数据小,讲比较的数据的元素后移一位*/
            while (preIndex >= 0 && currentValue < nums[preIndex]) {
                nums[preIndex + 1] = nums[preIndex];
                preIndex--;
                System.out.println(Arrays.toString(nums));
            }
            /*while循环结束时,说明已经找到了当前待排序数据的合适位置,插入*/
            nums[preIndex + 1] = currentValue;
            System.out.println("本轮被插入排序后的数组");
            System.out.println(Arrays.toString(nums));
            System.out.println("----------------------");

        }
        return nums;
    }
}
```

## 快速排序（Quick Sort）

通过选择一个基准元素，将数组分割为左右两部分，然后递归地对两部分进行排序。

```java
public class QuickSort {
    public static void sortArray(int[] nums) {
        sort(nums, 0, nums.length - 1);
        System.out.println(Arrays.toString(nums));
    }

    private static void sort(int[] nums, int low, int high) {
        if (low >= high) return;
        int left = low;
        int right = high;
        int pivot = nums[low];
        while (left < right) {
            while (left < right && nums[right] >= pivot) {
                right--;
            }
            while (left < right && nums[left] <= pivot) {
                left++;
            }
            if (left < right) {
                int temp = nums[left];
                nums[left] = nums[right];
                nums[right] = temp;
            }
        }

        //left==right
        nums[low] = nums[left];
        nums[left] = pivot;

        sort(nums, low, left - 1);
        sort(nums, left + 1, high);
    }
}
```

## 归并排序（Merge Sort）

将数组递归地分割为两个子数组，然后将两个有序子数组合并为一个有序数组。

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

## 堆排序（Heap Sort）

通过构建最大堆或最小堆来进行排序。

```java

public class HeapSort {
    //声明全局变量，用于记录数组Array的长度
    private static int len;

    public static int[] sortArray(int[] nums) {
        len = nums.length;
        if (len < 1) return nums;
        /*1.构建一个最大堆*/
        buildMaxHeap(nums);
        /*2.循环将堆首位(最大值)与未排序数据末位交换，然后重新调整最大堆*/
        while (len > 0) {
            swap(nums, 0, len - 1);
            len--;
            adjustHeap(nums, 0);
            System.out.println(Arrays.toString(nums));
            System.out.println("-------------------");
        }
        return nums;
    }

    private static void buildMaxHeap(int[] nums) {
        /*从最后一个非叶子节点开始向上构建最大堆*/
        /* 对于完全二叉树： 最后一个非叶子节点的位置为  (n/2)-1, n为数组长度  */
        for (int i = len / 2 - 1; i > 0; i--) {
            adjustHeap(nums, i);
        }
        System.out.println("构造完成最大堆");
        System.out.println(Arrays.toString(nums));
        System.out.println("====================");
    }

    private static void adjustHeap(int[] array, int i) {
        int maxIndex = i;
        /*  对于完全二叉树：左子节点位置= 2*k+1  , 右子节点位置= 2*(k+1)  */
        int left = 2 * i + 1;
        int right = 2 * (i + 1);

        /*  如果有左子树,且左子树大于父节点,则将最大指针指向左子树  */
        if (left < len && array[left] > array[maxIndex]) {
            maxIndex = left;
        }
        /*  如果有右子树,且右子树大于父节点且大于左子树,则将最大指针指向右子树  */
        if (right < len && array[right] > array[maxIndex] && array[right] > array[left]) {
            maxIndex = right;
        }
        if (maxIndex != i) {
            swap(array, maxIndex, i);
            System.out.println(Arrays.toString(array));
            //因为有数据交换，所以继续递归调整
            adjustHeap(array, maxIndex);
        }
    }


    private static void swap(int[] array, int i, int j) {
        int temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
```

## 希尔排序（Shell Sort）

将数组分割为多个子序列，对每个子序列进行插入排序，然后逐步缩小子序列的间隔，最终进行一次插入排序。

```java
public class ShellSort {
    public static int[] sortArray(int[] nums) {
        int len = nums.length;
        /*按增量分组后，每个分组中，temp代表当前待排序的数据，该元素之前的组内元素均已被排序过*/
        /*grp指用来分组的增量，会依次递减*/
        int currentValue, grp = len / 2;
        while (grp > 0) {
            for (int i = grp; i < len; i++) {
                currentValue = nums[i];
                /*组内已被排序数据的索引*/
                int preIndex = i - grp;
                /*在组内已被排序过数据中倒序寻找合适的位置，如果当前待排序数据比比较的元素要小，则将比较元素在组内后移一位*/
                while (preIndex >= 0 && nums[preIndex] > currentValue) {
                    nums[preIndex + grp] = nums[preIndex];
                    preIndex -= grp;
                }
                /*while循环结束时，说明已经找到了当前待排序数据的合适位置，插入*/
                nums[preIndex + grp] = currentValue;
            }
            System.out.println("本轮增量" + "[" + grp + "]" + "排序后的数组");
            System.out.println(Arrays.toString(nums));
            System.out.println("-----------------------------------");
            grp /= 2;
        }
        return nums;
    }
}
```

## 计数排序（Counting Sort）

通过统计每个元素出现的次数，然后根据统计结果进行排序。

```java
public class CountingSort {
    public static int[] sortArray(int[] nums) {
        if (nums.length == 0) return nums;
        /*寻找数组中最大值和最小值,
         * bias:偏移量，用来定位 原始数组 每个元素在 计数数组 中的下标位置*/
        int bias, min = nums[0], max = nums[0];
        for (int i = 1; i < nums.length; i++) {
            max = Math.max(nums[i], max);
            min = Math.min(nums[i], min);
        }
        bias = -min;
        /*初始化计数数组  (max-min+1) 为容量大小*/
        int[] counterArray = new int[max - min + 1];
        /*遍历整个原始数组，将原始数组中每个元素值转化为计数数组下标,并将计数数组下标对应的元素值大小进行累加*/
        for (int i = 0; i < nums.length; i++) {
            counterArray[nums[i] + bias]++;
        }
        System.out.println("计数数组为：" + Arrays.toString(counterArray) + " 最大值为：" + max + "  最小值为：" + min);
        System.out.println("===========================");

        int i = 0;/*访问原始数组时的下标计数器*/
        int j = 0;/*访问计数数组时的下标计数器*/
        /*访问计数数组，将计数数组中的元素进行转换后，重新写入到原始数组*/

        while (i < nums.length) {
            /*只要计数数组当前下标元素的值不为0,就将计数数组中的元素转换后，重新写回原始数组*/
            if (counterArray[j] != 0) {
                nums[i] = j - bias;
                counterArray[j]--;
                i++;
            } else {
                j++;
            }
            System.out.println(Arrays.toString(counterArray));
            System.out.println(Arrays.toString(nums));
            System.out.println("-----------------------");
        }
        return nums;
    }
}
```

## 桶排序（Bucket Sort）

将元素分配到不同的桶中，对每个桶中的元素进行排序，然后按顺序合并所有桶的元素。

```java
public class BucketSort {
    /**
     * @param array
     * @param bucketCap 桶的容量，即每个桶所能放置多少个不同数值
     * @return
     */
    public static ArrayList<Integer> sortArray(ArrayList<Integer> array, int bucketCap) {
        if (array == null || array.size() < 2) return array;
        int max = array.get(0);
        int min = array.get(0);
        /*找到最大值和最小值*/
        for (int i = 0; i < array.size(); i++) {
            max = Math.max(max, array.get(i));
            min = Math.min(min, array.get(i));
        }
        /*获得桶的数量*/
        int bucketCount = (max - min) / bucketCap + 1;
        /*构建桶*/
        ArrayList<ArrayList<Integer>> bucketArr = new ArrayList<>();
        for (int i = 0; i < bucketCount; i++) {
            bucketArr.add(new ArrayList<>());
        }
        /*将原始数组中的数据分配到桶中*/
        for (int i = 0; i < array.size(); i++) {
            bucketArr.get((array.get(i) - min) / bucketCap).add(array.get(i));
        }
        /*看看桶中的数据分布*/
        for (int i = 0; i < bucketArr.size(); i++) {
            System.out.println("第" + i + "个桶包含数据:" + bucketArr.get(i).toString());
        }
        ArrayList<Integer> resultArr = new ArrayList<>();
        for (int i = 0; i < bucketCount; i++) {
            if (bucketCap == 1) {
                for (int j = 0; j < bucketArr.get(i).size(); j++) {
                    resultArr.add(bucketArr.get(i).get(j));
                }
            } else {
                if (bucketCount == 1) {
                    bucketCap--;
                }
                System.out.println("对第" + i + "桶中的数据再次用桶进行排序---");
                /*对桶中的数据再次用桶进行排序*/
                ArrayList<Integer> temp = sortArray(bucketArr.get(i), bucketCap);
                for (int j = 0; j < temp.size(); j++) {
                    resultArr.add(temp.get(j));
                    System.out.println("resultArr桶中的数据再次用桶进行排序---");

                }
            }
        }
        return resultArr;
    }
}

```

## 基数排序（Radix Sort）

将元素按照位数从低到高进行排序，每个位数使用稳定的排序算法。

```java
public class RadixSort {
    public static int[] sortArray(int[] nums) {
        if (nums.length < 2) {
            return nums;
        }
        /*找出最大数*/
        int max = nums[0];
        for (int i = 1; i < nums.length; i++) {
            max = Math.max(max, nums[i]);
        }
        /*先算出最大数的位数，它决定了我们要进行几轮排序*/
        int maxDigit = 0;
        while (max != 0) {
            max /= 10;
            maxDigit++;
        }
        /*mod,div求模与进位，例如 12%10/1=2 个位是2， 12%100/10=1 十位是1*/
        int mod = 10, div = 1;
        /*构建桶 10进制基数0~9*/
        ArrayList<ArrayList<Integer>> bucketList = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            bucketList.add(new ArrayList<Integer>());
        }
        /*按照从右往左的顺序，依次将每一位都当作一次关键字，然后按照该关键字对数组排序，每一轮排序都基于上一轮排序后的结果*/
        for (int i = 0; i < maxDigit; i++, mod *= 10, div *= 10) {
            System.out.println("---第" + i + "轮排序开始---");
            for (int j = 0; j < nums.length; j++) {
                int num = (nums[j] % mod) / div;
                bucketList.get(num).add(nums[j]);
            }
            /*看看桶中的分布 */
            for (int j = 0; j < bucketList.size(); j++) {
                System.out.println("---第" + j + "个桶包含数据： " + bucketList.get(j));
            }
            /*桶中的数据写回原始数组,清除桶，准备下一轮排序*/
            int index = 0;
            for (int j = 0; j < bucketList.size(); j++) {
                for (int k = 0; k < bucketList.get(j).size(); k++) {
                    nums[index++] = bucketList.get(j).get(k);
                }
                bucketList.get(j).clear();
            }
            System.out.println("---第" + i + "轮排序结束---" + Arrays.toString(nums));
        }
        return nums;
    }
}
```











