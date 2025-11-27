self.addEventListener('push', event => {
  const data = event.data?.json() || { title: 'Tin nhắn mới', body: 'Bạn có tin nhắn mới!' };
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192.png'
  });
});