<template>
  <canvas class="webgl"></canvas>
</template>

<script lang="ts">
import GL from '../assets/js/webgl/GL'

export default {
    data() {
        return {
            gl: null as unknown as GL
        }
    },
    mounted() {
        let gl = GL.getInstance()
    },
    methods: {
    }
}

</script>

<style scoped>
    canvas {
        /* pointer-events: none; */
    }
</style>
