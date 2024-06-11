    document.addEventListener('alpine:init', () => {
        Alpine.data('timeTracking', () => ({
            intervalIDs: [],
            intervalSessionIDs: [],
            timeTracking: [],
            timeTrackingSession: [],
            showLogList: [],
            isRunning: [],
            timeTrackingData: null,
            addSessionManually: [],
            timeStartSession: [],
            timeEndSession: [],
            dateStartSession: null,
            dateEndSession: null,
            currentDate: null,
            minDate: null,
            maxDate: null,
            timeTrackingManually: [],
            rangeTotalManually: 0,
            addManuallyError: null,
            timeTrackingList:
                {
                    "id": 3,
                    "time_tracking": 18,
                    "running": true,
                    "interval_id": null,
                    "time_duration_start": 1715157749938,
                    "time_tracking_log": [
                        {
                            "id": 2,
                            "author_image": "",
                            "date_log": 1715157735514,
                            "start_time_log": 1715157735514,
                            "end_time_log": 1715157748386,
                            "total_time": 12872,
                            "addType": 1
                        },
                        {
                            "id": 1,
                            "author_image": "",
                            "date_log": 1715157724970,
                            "start_time_log": 1715157724970,
                            "end_time_log": 1715157731370,
                            "total_time": 6400,
                            "addType": 1
                        }
                    ]
                }
            ,

            init() {
                let self = this;
                self.dateStartSession = self.getCurrentDate();
                self.dateEndSession = self.getCurrentDate();
                self.currentDate = self.getCurrentDate();

                this.timeTrackingList = localStorage.getItem("timeTrackingData") ?
                    JSON.parse(localStorage.getItem("timeTrackingData")) : this.timeTrackingList;

                let item = self.timeTrackingList
                    if(item.running) {
                        let totalLogTime = 0;
                        if(item.time_tracking_log.length) {
                            item.time_tracking_log.forEach((log, index) => {
                                totalLogTime += log.total_time;
                            })
                            item.time_tracking = Math.round((new Date().getTime() - item.time_duration_start + totalLogTime)/1000);
                        } else {
                            item.time_tracking = Math.round((new Date().getTime() - item.time_duration_start)/1000);
                        }
                        self.timeInterval(item);
                        self.timeIntervalSession(item);
                    }

                document.addEventListener('click', function() {
                    if (!event.target.closest('.time-tracking-log-item')
                        && !event.target.closest('.time-log-icon-delete svg')
                        && !event.target.closest('.time-log-icon-delete svg path')
                    ) {
                        self.showLogList.forEach((element, index) => {
                            if(self.showLogList[index] === true) {
                                self.showLogList[index] = false;
                            }
                        })
                    }
                });
            },

            clearAllLog: function(item) {
                let self = this;
                item.time_tracking_log = [];
                if(item.running) {
                    item.time_tracking = Math.round((new Date().getTime() - item.time_duration_start)/1000);
                }else {
                    item.time_tracking = 0;
                }
                localStorage.setItem("timeTrackingData", JSON.stringify(self.timeTrackingList));
            },

            handleDeleteLogItem: function(item, element) {
                let self = this;
                let totalLogTime = element.total_time;
                item.time_tracking_log = item.time_tracking_log.filter((i) => i.id !== element.id);
                item.time_tracking -= Math.round(totalLogTime/1000);
                item.time_tracking = item.time_tracking >= 0 ? item.time_tracking : 0;
                self.updateTimeTracking(item);
                self.addManuallyError = '';
                localStorage.setItem("timeTrackingData", JSON.stringify(self.timeTrackingList));
            },

            areIntervalsOverlapping: function(start1, end1, start2, end2) {
                return start1 < end2 && end1 > start2;
            },

            updateTimeTracking: function(item) {
                let self = this;
                self.timeTracking[item.id] = {hours: (`0${parseInt(item.time_tracking / 3600)}h`).substr(-3),
                    minutes: (`0${(parseInt(item.time_tracking / 60)) % 60}m`).substr(-3),
                    seconds: (`0${item.time_tracking % 60}s`).substr(-3)};
            },

            handleAddSession: function(item) {
                let self = this;
                let startSessionTime = new Date(`${self.dateStartSession}T${self.timeStartSession[item.id]}:00`).getTime();
                let endSessionTime = new Date(`${self.dateEndSession}T${self.timeEndSession[item.id]}:00`).getTime();
                let isDurationTimeIsset = false;

                for (let i = 0; i < item.time_tracking_log.length; i++) {
                    let element = item.time_tracking_log[i];
                    isDurationTimeIsset = self.areIntervalsOverlapping(startSessionTime, endSessionTime,
                        new Date(element.start_time_log), new Date(element.end_time_log));
                    self.addManuallyError = 'You have an existing session at this time';
                    if (isDurationTimeIsset) break;
                }
                if(!self.rangeTotalManually > 0) self.addManuallyError = 'The end time must be after the start time';
                if((new Date().getTime() - endSessionTime) <= 0) self.addManuallyError = 'The end time can\'t be in the future';

                if(self.rangeTotalManually > 0 && !isDurationTimeIsset && (new Date().getTime() - endSessionTime) > 0) {
                    self.addSessionManually[item.id] = false;
                    item.time_tracking_log.unshift({
                        "id": item.time_tracking_log.length + 1,
                        "author_image": "",
                        "date_log": startSessionTime,
                        "start_time_log": startSessionTime,
                        "end_time_log": endSessionTime,
                        "total_time": self.rangeTotalManually * 1000,
                        "addType": 2
                    })
                    item.time_tracking += self.rangeTotalManually;
                    self.updateTimeTracking(item);
                    self.addManuallyError = null;
                    localStorage.setItem("timeTrackingData", JSON.stringify(self.timeTrackingList));
                }
            },

            updateTimeSession: function(item) {
                let self = this;
                let startSession = new Date(`${self.dateStartSession}T${self.timeStartSession[item.id]}:00`);
                let endSession = new Date(`${self.dateEndSession}T${self.timeEndSession[item.id]}:00`);

                let rangeTotal = Math.round((endSession - startSession)/1000);
                self.rangeTotalManually = rangeTotal > 0 ? rangeTotal : 0;

                self.timeTrackingManually[item.id]['seconds'] = (`0${rangeTotal % 60}s`).substr(-3);
                self.timeTrackingManually[item.id]['minutes'] = (`0${(parseInt(rangeTotal / 60)) % 60}m`).substr(-3);
                self.timeTrackingManually[item.id]['hours'] = (`0${parseInt(rangeTotal / 3600)}h`).substr(-3);
            },

            handleDefaultTimeSession: function(type = null) {
                let currentDate = new Date();
                let minutes = currentDate.getMinutes();
                let hours = type === 'timeStart' ? currentDate.getHours() - 1 : currentDate.getHours();
                return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            },

            getCurrentDate: function() {
                let currentDate = new Date();
                let year = currentDate.getFullYear();
                let month = currentDate.getMonth() + 1;
                let day = currentDate.getDate();
                return year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
            },

            // handle time interval session
            timeIntervalSession: function(item) {
                let self = this;
                let seconds = Math.round((new Date().getTime() - item.time_duration_start)/1000);
                self.intervalSessionIDs[item.id] = setInterval(function() {
                    seconds++;
                    self.timeTrackingSession[item.id]['seconds'] = (`0${seconds % 60}`).substr(-2);
                    self.timeTrackingSession[item.id]['minutes'] = (`0${(parseInt(seconds / 60)) % 60}`).substr(-2) + ' : ';
                    self.timeTrackingSession[item.id]['hours'] = (`0${parseInt(seconds / 3600)}`).substr(-2) + ' : ';
                }, 1000);
            },

            //handle time interval
            timeInterval: function(item) {
                let self = this;
                self.intervalIDs[item.id] = setInterval(function() {
                    item.time_tracking++;
                    self.timeTracking[item.id]['seconds'] = (`0${item.time_tracking % 60}s`).substr(-3);
                    self.timeTracking[item.id]['minutes'] = (`0${(parseInt(item.time_tracking / 60)) % 60}m`).substr(-3);
                    self.timeTracking[item.id]['hours'] = (`0${parseInt(item.time_tracking / 3600)}h`).substr(-3);
                }, 1000);
            },

            //handle start time
            TimeStart: function(item) {
                let self = this;

                //show icon running
                item.running = true;
                item.time_duration_start = new Date().getTime();

                self.timeInterval(item);
                self.timeIntervalSession(item);
                localStorage.setItem("timeTrackingData", JSON.stringify(self.timeTrackingList));
            },

            //handle stop time
            TimeStop: function (item) {
                let self = this;
                //show icon stop
                item.running = false;

                //clearInterval to Stop
                clearInterval(self.intervalIDs[item.id]);
                clearInterval(self.intervalSessionIDs[item.id]);
                self.timeTrackingSession[item.id]['seconds'] = '';
                self.timeTrackingSession[item.id]['minutes'] = '';
                self.timeTrackingSession[item.id]['hours'] = '';

                let startLog = item.time_duration_start;
                let endLog = new Date().getTime();
                let totalTime = endLog - startLog;

                if(totalTime > 1000) {
                    item.time_tracking_log.unshift({
                        "id": item.time_tracking_log.length + 1,
                        "author_image": "",
                        "date_log": startLog,
                        "start_time_log": startLog,
                        "end_time_log": endLog,
                        "total_time": totalTime,
                        "addType": 1
                    })
                }

                localStorage.setItem("timeTrackingData", JSON.stringify(self.timeTrackingList));
            },

            //convert Time
            convertTime: function (time, type = null) {
                let timeSeconds = time/1000;
                let optionDate = new Date(time);
                let hours = optionDate.getHours();
                let minutes = optionDate.getMinutes();
                let seconds = optionDate.getSeconds();

                if(type === 'onlyTime') {
                    let amOrPm = "AM";
                    if (hours >= 12) {
                        amOrPm = "PM";
                        if (hours > 12) {
                            hours -= 12;
                        }
                    }
                    return `${hours}:${minutes.toString().padStart(2, "0")} ${amOrPm}`;
                } else if (type === 'onlyDay') {
                    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    let day = optionDate.getDate();
                    let monthIndex = optionDate.getMonth();
                    let month = months[monthIndex];
                    return day + ' ' + month;
                } else {
                    let hours = parseInt(timeSeconds / 3600);
                    let minutes = parseInt((timeSeconds % 3600) / 60);
                    let seconds = parseInt(timeSeconds % 60);
                    let formatNumber = num => String(num).padStart(2, '0');
                    return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
                }
            }
        }))
    })
