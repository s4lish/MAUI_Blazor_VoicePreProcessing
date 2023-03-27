using Microsoft.AspNetCore.Components;

namespace VoicePreProcessing.Shared
{
    public partial class ShowToast
    {

        private string toastTitle;
        private string toastMessage;
        private string toastClass;
        private ToastType toastType;
        private string toastTime;
        private bool openToast = false;
        private int second = 4;

        public ShowToast()
        {
            toastClass = GetToastClass(ToastType.Success);
            toastTime = DateTime.Now.ToString("HH:mm");

        }

        [Parameter]
        public EventCallback CloseToast { get; set; }

        [Parameter]
        public bool OpenToast
        {
            get { return openToast; }
            set
            {
                openToast = value;
                StateHasChanged();
            }
        }

        [Parameter]
        public ToastType ToastClass
        {
            get { return toastType; }
            set
            {
                toastClass = GetToastClass(value);
                StateHasChanged();
            }
        }

        [Parameter]
        public string ToastTitle
        {
            get { return toastTitle; }
            set
            {
                toastTitle = value;
                StateHasChanged();
            }
        }

        [Parameter]
        public string ToastMessage
        {
            get { return toastMessage; }
            set
            {
                toastMessage = value;
                StateHasChanged();
            }
        }

        private async Task HideToast()
        {
            //openToast = false;
            await CloseToast.InvokeAsync();
            StateHasChanged();
        }

        private string GetToastClass(ToastType type)
        {
            return type switch
            {
                ToastType.Success => "toast show bg-success",
                ToastType.Info => "toast show bg-info",
                ToastType.Warning => "toast show bg-warning",
                ToastType.Error => "toast show bg-danger",
                _ => "toast show"
            };
        }

    }

    public enum ToastType
    {
        Success,
        Info,
        Warning,
        Error
    }
}
