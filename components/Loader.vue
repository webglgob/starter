<template>
    <div v-if="isDisplayed" class="overlay">
        <div class="container">
            <p id="progressNumber">0%</p>
            <div class="progress-bar-wrapper">
                <div id="progressBar"></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import gsap from 'gsap/all'
import EventBus from '~/assets/js/utils/EventBus'
import { UIEvents } from '~/assets/js/utils/Events'

export default {

    mounted() {
        EventBus.on(UIEvents.UPDATE_LOADER, (e: any) => this.updateLoader(e.progress))
        EventBus.on(UIEvents.TOGGLE_LOADER, () => this.dismissLoader())
    },

    data: () => ({
        isDisplayed: true
    }),

    methods: {
        updateLoader(progress: any) {
            gsap.to(document.querySelector('#progressBar'), {
                duration: 0.5,
                scaleX: progress/100,
            })

            const progressNumber = document.querySelector('#progressNumber')

            if (progressNumber) {
                gsap.from(progressNumber, {
                    snap: { textContent: 1 },
                    stagger: {
                        each: 1.0,
                        onUpdate: function() {
                            progressNumber.innerHTML = Math.round(progress) + '%'
                        },
                    }
                })
            }            
        },
        dismissLoader() {
            gsap.to(document.querySelector('.overlay'), {
                duration: 1,
                opacity: 0,
                onComplete() {
                    // TODO : Dunno why yet but setting display to false here doesn't work
                }
            })
            this.isDisplayed = false
        }
    }
}

</script>

<style scoped>
    .overlay {
        position: absolute;
        z-index: 3;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        background-color: #26272b;
        color: white;
        transform-origin: left;
    }

    .container {
        margin: auto;
        width: fit-content;
    }
    
    p {
        font-size: 1rem;
        text-align: center;
        text-transform: uppercase;
        margin-bottom: 2rem;
    }

    .progress-bar-wrapper {
        position: relative;
        width: 12rem;
        height: 1rem;
    }

    .progress-bar-wrapper::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #18181a;
    }

    #progressBar {
        width: 100%;
        height: 100%;
        transform: scaleX(0);
        transform-origin: left;
        background-color: white;
    }
</style>
